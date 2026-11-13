import { supabase } from "@/integrations/supabase/client";
import { db, type Batch, type Bird, type Egg, type EggEvent, type EggStatus, type Incubator } from "./db";

const PHOTOS = "bird-photos";
const photoPath = (userId: string, birdId: string) => `${userId}/${birdId}.jpg`;

let running: Promise<void> | null = null;
const listeners = new Set<(s: SyncState) => void>();
export type SyncState = { status: "idle" | "syncing" | "error" | "offline"; lastSynced?: number; error?: string };
let state: SyncState = { status: "idle" };
function set(s: SyncState) {
  state = s;
  listeners.forEach((l) => l(s));
}
export function getSyncState() {
  return state;
}
export function onSyncState(l: (s: SyncState) => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

async function fetchAll<T>(table: "incubators" | "batches" | "eggs" | "egg_events" | "birds"): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + 999);
    if (error) throw error;
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) return out;
  }
}

async function push(userId: string) {
  const inc = await db.incubators.where("synced").equals(0).toArray();
  if (inc.length) {
    const { error } = await supabase.from("incubators").upsert(
      inc.map((i) => ({ id: i.id, user_id: userId, name: i.name, capacity: i.capacity, created_at: i.createdAt, updated_at: i.updatedAt })),
    );
    if (error) throw error;
    await db.incubators.bulkUpdate(inc.map((i) => ({ key: i.id, changes: { synced: 1 as const } })));
  }
  const bat = await db.batches.where("synced").equals(0).toArray();
  if (bat.length) {
    const { error } = await supabase.from("batches").upsert(
      bat.map((b) => ({ id: b.id, user_id: userId, incubator_id: b.incubatorId, name: b.name, set_date: b.setDate, status: b.status, created_at: b.createdAt, updated_at: b.updatedAt })),
    );
    if (error) throw error;
    await db.batches.bulkUpdate(bat.map((b) => ({ key: b.id, changes: { synced: 1 as const } })));
  }
  const eggs = await db.eggs.where("synced").equals(0).toArray();
  if (eggs.length) {
    const { error } = await supabase.from("eggs").upsert(
      eggs.map((e) => ({ id: e.id, user_id: userId, batch_id: e.batchId, position: e.position, label: e.label, breed: e.breed, breed_uncertain: e.breedUncertain, source: e.source, status: e.status, updated_at: e.updatedAt })),
    );
    if (error) throw error;
    await db.eggs.bulkUpdate(eggs.map((e) => ({ key: e.id, changes: { synced: 1 as const } })));
  }
  const ev = await db.eggEvents.where("synced").equals(0).toArray();
  if (ev.length) {
    const { error } = await supabase.from("egg_events").upsert(
      ev.map((e) => ({ id: e.id, user_id: userId, egg_id: e.eggId, batch_id: e.batchId, from_status: e.from, to_status: e.to, day: e.day, at: e.at, updated_at: e.at })),
    );
    if (error) throw error;
    await db.eggEvents.bulkUpdate(ev.map((e) => ({ key: e.id, changes: { synced: 1 as const } })));
  }
  const birds = await db.birds.where("synced").equals(0).toArray();
  for (const b of birds) {
    if (b.photoSynced !== 0) continue;
    const path = photoPath(userId, b.id);
    if (b.photo) {
      const { error } = await supabase.storage.from(PHOTOS).upload(path, b.photo, { upsert: true, contentType: "image/jpeg" });
      if (error) throw error;
    } else {
      await supabase.storage.from(PHOTOS).remove([path]);
    }
  }
  if (birds.length) {
    const { error } = await supabase.from("birds").upsert(
      birds.map((b) => ({
        id: b.id, user_id: userId, name: b.name, breed: b.breed, breed_uncertain: !!b.breedUncertain, hatch_date: b.hatchDate ?? null,
        sire: b.sire ?? "", dam: b.dam ?? "", notes: b.notes ?? "", from_egg_id: b.fromEggId ?? null,
        photo_at: b.photo ? (b.photoAt ?? b.updatedAt) : null, created_at: b.createdAt ?? b.updatedAt, updated_at: b.updatedAt,
      })),
    );
    if (error) throw error;
    await db.birds.bulkUpdate(birds.map((b) => ({ key: b.id, changes: { synced: 1 as const, photoSynced: 1 as const } })));
  }
  for (const t of await db.tombstones.toArray()) {
    const { error } = await supabase.from(t.table).update({ deleted: true, updated_at: Date.now() }).eq("id", t.id);
    if (error) throw error;
    if (t.table === "birds") await supabase.storage.from(PHOTOS).remove([photoPath(userId, t.id)]);
    await db.tombstones.delete(t.id);
  }
}

type R<T> = T & { deleted: boolean; updated_at: number };

async function pull() {
  const [inc, bat, eggs, ev, birds] = await Promise.all([
    fetchAll<R<{ id: string; name: string; capacity: number; created_at: number }>>("incubators"),
    fetchAll<R<{ id: string; incubator_id: string; name: string; set_date: string; status: string; created_at: number }>>("batches"),
    fetchAll<R<{ id: string; batch_id: string; position: number; label: string; breed: string; breed_uncertain: boolean; source: string; status: string }>>("eggs"),
    fetchAll<R<{ id: string; egg_id: string; batch_id: string; from_status: string; to_status: string; day: number; at: number }>>("egg_events"),
    fetchAll<R<{ id: string; user_id: string; name: string; breed: string; breed_uncertain: boolean; hatch_date: string | null; sire: string; dam: string; notes: string; from_egg_id: string | null; photo_at: number | null; created_at: number }>>("birds"),
  ]);
  // Remote wins unless the local copy has newer unsynced edits.
  const keep = (local: { updatedAt: number; synced: 0 | 1 } | undefined, remoteAt: number) =>
    !local || local.synced === 1 || remoteAt >= local.updatedAt;
  await db.transaction("rw", [db.incubators, db.batches, db.eggs, db.eggEvents], async () => {
    for (const r of inc) {
      const l = await db.incubators.get(r.id);
      if (!keep(l, r.updated_at)) continue;
      if (r.deleted) await db.incubators.delete(r.id);
      else await db.incubators.put({ id: r.id, name: r.name, capacity: r.capacity, createdAt: r.created_at, updatedAt: r.updated_at, synced: 1 } satisfies Incubator);
    }
    for (const r of bat) {
      const l = await db.batches.get(r.id);
      if (!keep(l, r.updated_at)) continue;
      if (r.deleted) await db.batches.delete(r.id);
      else await db.batches.put({ id: r.id, incubatorId: r.incubator_id, name: r.name, setDate: r.set_date, status: r.status === "done" ? "done" : "active", createdAt: r.created_at, updatedAt: r.updated_at, synced: 1 } satisfies Batch);
    }
    for (const r of eggs) {
      const l = await db.eggs.get(r.id);
      if (!keep(l, r.updated_at)) continue;
      if (r.deleted) await db.eggs.delete(r.id);
      else await db.eggs.put({ id: r.id, batchId: r.batch_id, position: r.position, label: r.label, breed: r.breed, breedUncertain: r.breed_uncertain, source: r.source, status: r.status as EggStatus, updatedAt: r.updated_at, synced: 1 } satisfies Egg);
    }
    for (const r of ev) {
      if (await db.eggEvents.get(r.id)) continue;
      await db.eggEvents.put({ id: r.id, eggId: r.egg_id, batchId: r.batch_id, from: r.from_status as EggStatus, to: r.to_status as EggStatus, day: r.day, at: r.at, synced: 1 } satisfies EggEvent);
    }
  });
  // Birds are pulled outside the transaction because photos download from storage.
  for (const r of birds) {
    const l = await db.birds.get(r.id);
    if (!keep(l, r.updated_at)) continue;
    if (l && l.synced === 1 && !r.deleted && l.updatedAt === r.updated_at && l.photoAt === (r.photo_at ?? undefined)) continue;
    if (r.deleted) {
      await db.birds.delete(r.id);
      continue;
    }
    let photo = l?.photo;
    let photoAt = l?.photoAt;
    const remotePhotoAt = r.photo_at ?? undefined;
    if (remotePhotoAt !== photoAt) {
      if (remotePhotoAt) {
        const { data } = await supabase.storage.from(PHOTOS).download(photoPath(r.user_id, r.id));
        if (data) [photo, photoAt] = [data, remotePhotoAt];
      } else [photo, photoAt] = [undefined, undefined];
    }
    await db.birds.put({
      id: r.id, name: r.name, breed: r.breed, breedUncertain: r.breed_uncertain, hatchDate: r.hatch_date ?? undefined,
      sire: r.sire, dam: r.dam, notes: r.notes, fromEggId: r.from_egg_id ?? undefined, photo, photoAt, photoSynced: 1,
      createdAt: r.created_at, updatedAt: r.updated_at, synced: 1,
    } satisfies Bird);
  }
}

/** Push local changes, then pull everything from the cloud. Safe to call often. */
export function syncNow(): Promise<void> {
  if (running) return running;
  running = (async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return set({ ...state, status: "offline" });
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return set({ status: "idle" });
    set({ ...state, status: "syncing" });
    try {
      await push(userId);
      await pull();
      set({ status: "idle", lastSynced: Date.now() });
    } catch (e) {
      set({ ...state, status: "error", error: e instanceof Error ? e.message : String(e) });
    }
  })().finally(() => {
    running = null;
  });
  return running;
}
