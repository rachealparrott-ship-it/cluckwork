import Dexie, { type EntityTable } from "dexie";
import { birdFromHatchedEgg } from "./flock";
import { addDays, toLocalIso } from "./schedule";

export type EggStatus = "unknown" | "developing" | "clear" | "quit" | "hatched";

export interface Incubator {
  id: string;
  name: string;
  capacity: number;
  createdAt: number;
  updatedAt: number;
  synced: 0 | 1;
}

export interface Batch {
  id: string;
  incubatorId: string;
  name: string;
  setDate: string; // YYYY-MM-DD
  status: "active" | "done";
  createdAt: number;
  updatedAt: number;
  synced: 0 | 1;
}

export interface Egg {
  id: string;
  batchId: string;
  position: number;
  label: string;
  breed: string;
  breedUncertain: boolean;
  source: string;
  status: EggStatus;
  updatedAt: number;
  synced: 0 | 1;
}

/** A bird in the flock register. Chicks marked hatched get one automatically (id = egg id). */
export interface Bird {
  id: string;
  name: string;
  breed: string;
  breedUncertain?: boolean | undefined;
  hatchDate?: string | undefined; // YYYY-MM-DD
  sire?: string | undefined;
  dam?: string | undefined;
  photo?: Blob | undefined;
  /** When the photo last changed; undefined = no photo. */
  photoAt?: number | undefined;
  /** 0 = photo change not yet uploaded. */
  photoSynced?: 0 | 1 | undefined;
  notes?: string | undefined;
  fromEggId?: string | undefined;
  createdAt?: number | undefined;
  updatedAt: number;
  synced: 0 | 1;
}

/** One status change for an egg, stamped with the incubation day it happened on. */
export interface EggEvent {
  id: string;
  eggId: string;
  batchId: string;
  from: EggStatus;
  to: EggStatus;
  day: number;
  at: number;
  synced: 0 | 1;
}

/** A local delete waiting to be sent to the cloud. */
export interface Tombstone {
  id: string;
  table: "incubators" | "batches" | "eggs" | "birds";
}

/** Tracks which reminders were already shown so we don't repeat them. */
export interface SentReminder {
  key: string;
}

class HatchDB extends Dexie {
  incubators!: EntityTable<Incubator, "id">;
  batches!: EntityTable<Batch, "id">;
  eggs!: EntityTable<Egg, "id">;
  birds!: EntityTable<Bird, "id">;
  reminders!: EntityTable<SentReminder, "key">;
  eggEvents!: EntityTable<EggEvent, "id">;
  tombstones!: EntityTable<Tombstone, "id">;
  constructor() {
    super("hatch-and-flock");
    this.version(1).stores({
      incubators: "id, synced",
      batches: "id, incubatorId, status, setDate, synced",
      eggs: "id, batchId, status, synced",
      birds: "id, breed, synced",
      reminders: "key",
    });
    this.version(2).stores({ eggEvents: "id, eggId, batchId, synced" });
    this.version(3).stores({ tombstones: "id" });
    // v4: index birds by the egg they hatched from, and give already-hatched eggs a profile.
    this.version(4)
      .stores({ birds: "id, breed, synced, fromEggId" })
      .upgrade(async (tx) => {
        const eggs = (await tx.table("eggs").where("status").equals("hatched").toArray()) as Egg[];
        const now = Date.now();
        for (const egg of eggs) {
          if (await tx.table("birds").where("fromEggId").equals(egg.id).count()) continue;
          const events = (await tx.table("eggEvents").where("eggId").equals(egg.id).toArray()) as EggEvent[];
          const hatchedAt = events.filter((e) => e.to === "hatched").sort((a, b) => b.at - a.at)[0]?.at;
          const batch = (await tx.table("batches").get(egg.batchId)) as Batch | undefined;
          const hatchDate = hatchedAt ? toLocalIso(new Date(hatchedAt)) : batch ? addDays(batch.setDate, 21) : undefined;
          await tx.table("birds").put(birdFromHatchedEgg(egg, hatchDate, now));
        }
      });
  }
}

export const db = new HatchDB();

export const uid = () => crypto.randomUUID();
