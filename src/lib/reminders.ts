import { db } from "./db";
import { localToday, milestonesFor } from "./schedule";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotifications(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  return Notification.requestPermission();
}

/** Show a notification for each of today's milestones that hasn't been shown yet. */
export async function checkReminders() {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const today = localToday();
  const batches = await db.batches.where("status").equals("active").toArray();
  for (const b of batches) {
    for (const m of milestonesFor(b.setDate)) {
      if (m.date !== today) continue;
      const key = `${b.id}:${m.kind}`;
      if (await db.reminders.get(key)) continue;
      const body = `${b.name}: ${m.label} (day ${m.day})`;
      const reg = await navigator.serviceWorker?.getRegistration().catch(() => undefined);
      if (reg) reg.showNotification("Hatch & Flock", { body, icon: "/icon-192.png" });
      else new Notification("Hatch & Flock", { body, icon: "/icon-192.png" });
      await db.reminders.put({ key });
    }
  }
}
