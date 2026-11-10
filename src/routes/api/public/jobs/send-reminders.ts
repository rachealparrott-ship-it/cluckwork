import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { milestonesFor } from "@/lib/schedule";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";

function todayIn(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export const Route = createFileRoute("/api/public/jobs/send-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const lovableKey = process.env["LOVABLE_API_KEY"];
        const fcmKey = process.env["FIREBASE_MESSAGING_API_KEY"];
        if (!lovableKey || !fcmKey) return new Response("Push not configured", { status: 500 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: tokens, error: tErr } = await supabaseAdmin.from("push_tokens").select("token, user_id, timezone");
        if (tErr) return Response.json({ error: tErr.message }, { status: 500 });
        if (!tokens?.length) return Response.json({ sent: 0 });

        const byUser = new Map<string, { tokens: string[]; tz: string }>();
        for (const t of tokens) {
          const u = byUser.get(t.user_id) ?? { tokens: [], tz: t.timezone };
          u.tokens.push(t.token);
          byUser.set(t.user_id, u);
        }

        const { data: batches, error: bErr } = await supabaseAdmin
          .from("batches")
          .select("id, user_id, name, set_date")
          .eq("status", "active")
          .eq("deleted", false)
          .in("user_id", [...byUser.keys()]);
        if (bErr) return Response.json({ error: bErr.message }, { status: 500 });

        let sent = 0;
        const failures: string[] = [];
        for (const b of batches ?? []) {
          const user = byUser.get(b.user_id);
          if (!user) continue;
          const today = todayIn(user.tz);
          for (const m of milestonesFor(b.set_date)) {
            if (m.date !== today) continue;
            // Claim this reminder once; skip if already sent.
            const { data: claimed } = await supabaseAdmin
              .from("sent_push_reminders")
              .upsert({ batch_id: b.id, kind: m.kind }, { onConflict: "batch_id,kind", ignoreDuplicates: true })
              .select();
            if (!claimed?.length) continue;
            for (const token of user.tokens) {
              const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
                method: "POST",
                headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": fcmKey, "Content-Type": "application/json" },
                body: JSON.stringify({
                  message: {
                    token,
                    notification: { title: `${m.label} today`, body: `${b.name} · day ${m.day}` },
                    data: { path: `/batches/${b.id}` },
                    webpush: { notification: { icon: "/icon-192.png" }, fcm_options: { link: `/batches/${b.id}` } },
                  },
                }),
              });
              if (res.ok) {
                sent++;
              } else {
                const body = await res.text();
                console.error(`FCM send failed [${res.status}]: ${body}`);
                failures.push(`${res.status}`);
                if (res.status === 404 || (res.status === 400 && body.includes("registration token"))) {
                  await supabaseAdmin.from("push_tokens").delete().eq("token", token);
                }
              }
            }
          }
        }
        return Response.json({ sent, failures });
      },
    },
  },
});
