import type { DrinkRecord } from "./types";

const KEY = "joojeong_records";

export function getRecords(): DrinkRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DrinkRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: DrinkRecord): void {
  const records = getRecords();
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.unshift(record);
  }
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function getRecord(id: string): DrinkRecord | undefined {
  return getRecords().find((r) => r.id === id);
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter((r) => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(records));
}
