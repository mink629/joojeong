"use client";

import { useState, useSyncExternalStore } from "react";
import { TopBar } from "@/components/TopBar";
import {
  getRecordsSnapshot,
  getServerRecordsSnapshot,
  subscribeRecords,
} from "@/lib/storage";
import { ALL_TYPES } from "@/lib/senseTags";
import type { DrinkType } from "@/lib/types";

export default function ReportPage() {
  const records = useSyncExternalStore(
    subscribeRecords,
    getRecordsSnapshot,
    getServerRecordsSnapshot
  );
  const [type, setType] = useState<DrinkType>("위스키");

  const typeRecords = records.filter((r) => r.type === type);

  const freq = new Map<string, number>();
  for (const record of typeRecords) {
    for (const tag of record.senseTags) {
      freq.set(tag, (freq.get(tag) ?? 0) + 1);
    }
  }
  const ranked = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const max = ranked[0]?.[1] ?? 0;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="내 취향 리포트" backHref="/" />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex gap-1.5">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={`rounded-full px-3 py-1.5 text-[11.5px] ${
                type === t
                  ? "bg-ink font-semibold text-bg"
                  : "border border-border text-ink-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="text-[11.5px] text-ink-muted">
          {type} 기록 {typeRecords.length}개 기준
        </p>

        {ranked.length === 0 ? (
          <EmptyReport type={type} />
        ) : (
          <div className="flex flex-col gap-3">
            {ranked.map(([tag, count], i) => (
              <div key={tag} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className={i === 0 ? "font-bold text-accent" : ""}>
                    {i === 0 && "👑 "}
                    {tag}
                  </span>
                  <span className="font-mono text-ink-muted">{count}회</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-hatch">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyReport({ type }: { type: DrinkType }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-ink-muted">
      <span className="text-3xl">📊</span>
      <p className="text-[13px] leading-relaxed">
        아직 {type} 기록이 없어요.
        <br />
        기록이 쌓이면 취향 패턴을 보여드릴게요.
      </p>
    </div>
  );
}
