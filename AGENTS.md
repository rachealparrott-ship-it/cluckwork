<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- All app data lives in IndexedDB via Dexie (`src/lib/db.ts`); records carry `updatedAt` + `synced` flags so a future cloud sync can push unsynced rows. Why: local-first, works offline.
- Incubation milestone math lives only in `src/lib/schedule.ts` (dates as YYYY-MM-DD, set date = day 0). Why: one tested source for the calendar.
- Service worker is registered only from `src/lib/pwa.ts` (vite-plugin-pwa generateSW, guarded off in dev/preview). Why: avoid stale previews.
- Cloud sync (`src/lib/sync.ts`) mirrors Dexie tables to Cloud tables owned per user (RLS by user_id): push unsynced rows, then pull all; local deletes go via `tombstones` and soft `deleted` flags. Why: local-first stays the source of truth offline.
- Closed-app reminders: device tokens in `push_tokens`, sent daily by the scheduled `/api/public/jobs/send-reminders` route via Firebase Messaging, deduped in `sent_push_reminders`; local notifications are skipped on devices with push on. Why: no double alerts.
- Guides are static typed content in `src/content/guides/` (one file per guide, registered in `index.ts`), rendered by `/guides` and `/guides/$slug`; every guide lists its sources. Why: easy to add guides without a database and they work offline.
