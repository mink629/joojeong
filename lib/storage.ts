import type { TastingRecord } from "./types";

const STORAGE_KEY = "joojeong.records";

const listeners = new Set<() => void>();
let snapshotCache: TastingRecord[] = [];
let snapshotCacheKey = "";

function notify() {
  listeners.forEach((listener) => listener());
}

function readAll(): TastingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TastingRecord[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: TastingRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  notify();
}

/** useSyncExternalStore-compatible subscription to the records list. */
export function subscribeRecords(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * Returns a cached, stable reference unless the underlying localStorage
 * value actually changed — required so useSyncExternalStore doesn't see a
 * "new" snapshot (and re-render forever) on every call.
 */
export function getRecordsSnapshot(): TastingRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  if (raw !== snapshotCacheKey) {
    snapshotCacheKey = raw;
    try {
      snapshotCache = (JSON.parse(raw) as TastingRecord[]).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
    } catch {
      snapshotCache = [];
    }
  }
  return snapshotCache;
}

const EMPTY_RECORDS: TastingRecord[] = [];

export function getServerRecordsSnapshot(): TastingRecord[] {
  return EMPTY_RECORDS;
}

export function getRecord(id: string): TastingRecord | undefined {
  return readAll().find((r) => r.id === id);
}

export function createRecord(
  input: Omit<TastingRecord, "id" | "createdAt">
): TastingRecord {
  const record: TastingRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  writeAll([record, ...readAll()]);
  return record;
}

export function updateRecord(
  id: string,
  patch: Partial<Omit<TastingRecord, "id" | "createdAt">>
): TastingRecord | undefined {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...patch };
  writeAll(all);
  return all[idx];
}

export function deleteRecord(id: string) {
  writeAll(readAll().filter((r) => r.id !== id));
}
