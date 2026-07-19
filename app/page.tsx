"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { RecordCard } from "@/components/RecordCard";
import { TopBar } from "@/components/TopBar";
import {
  getRecordsSnapshot,
  getServerRecordsSnapshot,
  subscribeRecords,
} from "@/lib/storage";
import type { DrinkType } from "@/lib/types";
import { SUPPORTED_TYPES } from "@/lib/senseTags";

const TABS: { label: string; value: "전체" | DrinkType }[] = [
  { label: "전체", value: "전체" },
  { label: "위스키", value: "위스키" },
  { label: "와인", value: "와인" },
  { label: "전통주", value: "전통주" },
];

export default function HomePage() {
  const records = useSyncExternalStore(
    subscribeRecords,
    getRecordsSnapshot,
    getServerRecordsSnapshot
  );
  const [tab, setTab] = useState<"전체" | DrinkType>("전체");

  const filtered = records.filter((r) => tab === "전체" || r.type === tab);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="내 술장" />

      <div className="relative flex flex-1 flex-col gap-4 p-4">
        <div className="flex gap-1.5">
          {TABS.map((t) => {
            const locked =
              t.value !== "전체" &&
              !SUPPORTED_TYPES.includes(t.value as DrinkType);
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                disabled={locked}
                onClick={() => setTab(t.value)}
                aria-pressed={active}
                className={`relative rounded-full px-3 py-1.5 text-[11.5px] ${
                  locked
                    ? "cursor-not-allowed border border-border pr-6 text-ink-muted/60"
                    : active
                      ? "bg-ink font-semibold text-bg"
                      : "border border-border text-ink-muted"
                }`}
              >
                {t.label}
                {locked && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-border px-1 font-mono text-[8px] text-ink-muted">
                    M2
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <EmptyState hasAnyRecord={records.length > 0} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}

        <Link
          href="/new"
          aria-label="새 기록 추가"
          className="fixed bottom-6 right-1/2 flex h-14 w-14 translate-x-[calc(50%-1.5rem)] items-center justify-center rounded-full bg-accent text-3xl font-light leading-none text-accent-ink shadow-lg sm:absolute sm:bottom-6 sm:right-6 sm:translate-x-0"
        >
          ＋
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ hasAnyRecord }: { hasAnyRecord: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-ink-muted">
      <span className="text-3xl">🥃</span>
      <p className="whitespace-pre-line text-[13px] leading-relaxed">
        {hasAnyRecord
          ? "이 주종에는 아직 기록이 없어요."
          : "아직 시음 기록이 없어요.\n첫 술을 기록해보세요."}
      </p>
    </div>
  );
}
