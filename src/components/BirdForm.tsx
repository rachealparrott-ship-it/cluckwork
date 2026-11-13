import { useLiveQuery } from "dexie-react-hooks";
import { Bird as BirdIcon, Camera, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { btnPrimary, btnSecondary, field } from "@/components/AppShell";
import { useObjectUrl } from "@/hooks/use-object-url";
import { db, type Bird } from "@/lib/db";
import { shrinkPhoto } from "@/lib/flock";

export type BirdDraft = Pick<Bird, "name" | "breed" | "breedUncertain" | "hatchDate" | "sire" | "dam" | "notes" | "photo">;

/** Photo, name, breed, hatch date, parents and notes for a bird. */
export function BirdForm({
  initial,
  selfId,
  submitLabel,
  onSubmit,
}: {
  initial?: Bird;
  selfId?: string;
  submitLabel: string;
  onSubmit: (draft: BirdDraft, photoChanged: boolean) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [breed, setBreed] = useState(initial?.breed ?? "");
  const [uncertain, setUncertain] = useState(!!initial?.breedUncertain);
  const [hatchDate, setHatchDate] = useState(initial?.hatchDate ?? "");
  const [sire, setSire] = useState(initial?.sire ?? "");
  const [dam, setDam] = useState(initial?.dam ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [photo, setPhoto] = useState<Blob | undefined>(initial?.photo);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);
  const photoUrl = useObjectUrl(photo);
  const others = useLiveQuery(() => db.birds.toArray(), []);
  const names = (others ?? []).filter((b) => b.id !== selfId && b.name.trim()).map((b) => b.name);

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    try {
      setPhoto(await shrinkPhoto(file));
      setPhotoChanged(true);
    } catch {
      setError("That photo couldn't be read. Try another one.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Give the bird a name or ring number.");
    setBusy(true);
    try {
      await onSubmit(
        { name: name.trim(), breed: breed.trim(), breedUncertain: uncertain, hatchDate: hatchDate || undefined, sire: sire.trim(), dam: dam.trim(), notes: notes.trim(), photo },
        photoChanged,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="card-soft overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={name ? `Photo of ${name}` : "Bird photo"} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="grid aspect-[4/3] w-full place-items-center bg-muted text-muted-foreground">
            <BirdIcon className="size-16" />
          </div>
        )}
        <div className="flex gap-2 p-3">
          <button type="button" className={`${btnSecondary} flex-1`} onClick={() => fileRef.current?.click()}>
            <Camera className="size-5" /> {photo ? "Change photo" : "Add photo"}
          </button>
          {photo && (
            <button
              type="button"
              aria-label="Remove photo"
              className="grid size-14 place-items-center rounded-xl text-destructive"
              onClick={() => {
                setPhoto(undefined);
                setPhotoChanged(true);
              }}
            >
              <Trash2 className="size-5" />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files?.[0])} />
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block font-semibold">Name or ring number</span>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Clementine" />
      </label>
      <label className="block">
        <span className="mb-1 block font-semibold">Breed</span>
        <input className={field} value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="e.g. Buff Orpington" />
      </label>
      <label className="flex min-h-12 items-center gap-3 text-lg">
        <input type="checkbox" className="size-6 accent-primary" checked={uncertain} onChange={(e) => setUncertain(e.target.checked)} />
        Breed uncertain
      </label>
      <label className="block">
        <span className="mb-1 block font-semibold">Hatch date</span>
        <input className={field} type="date" value={hatchDate} onChange={(e) => setHatchDate(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block font-semibold">Father (sire)</span>
          <input className={field} list="flock-names" value={sire} onChange={(e) => setSire(e.target.value)} placeholder="Cockerel" />
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">Mother (dam)</span>
          <input className={field} list="flock-names" value={dam} onChange={(e) => setDam(e.target.value)} placeholder="Hen" />
        </label>
      </div>
      <datalist id="flock-names">
        {names.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <label className="block">
        <span className="mb-1 block font-semibold">Notes</span>
        <textarea
          className={`${field} min-h-28 py-3`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Temperament, health, markings, laying…"
        />
      </label>
      {error && <p className="font-semibold text-destructive">{error}</p>}
      <button className={`${btnPrimary} w-full`} disabled={busy}>
        {busy && <Loader2 className="size-5 animate-spin" />} {submitLabel}
      </button>
    </form>
  );
}
