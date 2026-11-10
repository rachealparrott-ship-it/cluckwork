import Dexie, { type EntityTable } from "dexie";

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

export interface Bird {
  id: string;
  name: string;
  breed: string;
  hatchDate?: string;
  sire?: string;
  dam?: string;
  photo?: Blob;
  notes?: string;
  fromEggId?: string;
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
  table: "incubators" | "batches" | "eggs";
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
  }
}

export const db = new HatchDB();

export const uid = () => crypto.randomUUID();
