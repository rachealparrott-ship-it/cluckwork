import { supabase } from "@/integrations/supabase/client";

const appId = import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID as string | undefined;
const vapidKey = import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY as string | undefined;
const firebaseConfig = {
  apiKey: (import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY as string | undefined) ?? "",
  projectId: (import.meta.env.VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID as string | undefined) ?? "",
  appId: appId ?? "",
  messagingSenderId: appId?.split(":")[1] ?? "",
};

export type PushResult =
  | { status: "registered" }
  | { status: "not-configured" | "unsupported" | "open-in-new-tab" | "denied" | "signed-out" | "error"; message?: string };

const FLAG = "hf-push-enabled";
export function pushEnabledHere() {
  return typeof window !== "undefined" && localStorage.getItem(FLAG) === "1";
}

/** Call from a tap. Registers this device for reminders that arrive even when the app is closed. */
export async function enablePush(): Promise<PushResult> {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !appId || !vapidKey || !firebaseConfig.messagingSenderId) {
    return { status: "not-configured" };
  }
  const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
  const { initializeApp, getApps } = await import("firebase/app");
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !(await isSupported())) return { status: "unsupported" };
  if (window.top !== window.self) return { status: "open-in-new-tab" };
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { status: "signed-out" };

  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return { status: "denied" };
  try {
    const query = new URLSearchParams(firebaseConfig).toString();
    const reg = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${query}`, {
      scope: "/firebase-cloud-messaging-push-scope",
    });
    const app = getApps()[0] ?? initializeApp(firebaseConfig);
    const token = await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: reg });
    if (!token) return { status: "denied" };
    const { error } = await supabase.from("push_tokens").upsert({
      token,
      user_id: data.session.user.id,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
    });
    if (error) return { status: "error", message: error.message };
    localStorage.setItem(FLAG, "1");
    return { status: "registered" };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : String(e) };
  }
}

/** Show reminders that arrive while the app is open on screen. */
export async function listenForegroundPush() {
  if (!pushEnabledHere() || !appId) return;
  const { getMessaging, onMessage, isSupported } = await import("firebase/messaging");
  const { initializeApp, getApps } = await import("firebase/app");
  if (!(await isSupported())) return;
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  onMessage(getMessaging(app), (payload) => {
    const title = payload.notification?.title ?? "Hatch & Flock";
    new Notification(title, { body: payload.notification?.body, icon: "/icon-192.png" });
  });
}
