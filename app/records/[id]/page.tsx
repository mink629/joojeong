"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { TopBar } from "@/components/TopBar";
import { StarRating } from "@/components/StarRating";
import { deleteRecord, getRecord } from "@/lib/storage";
import type { TastingRecord } from "@/lib/types";

export default function RecordDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<TastingRecord | null | undefined>(
    undefined
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time localStorage lookup keyed off the route param, not a render-derived value
    setRecord(getRecord(params.id) ?? null);
  }, [params.id]);

  if (record === undefined) return null;

  if (record === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="기록을 찾을 수 없어요" backHref="/" />
      </div>
    );
  }

  function handleDelete() {
    if (!record) return;
    if (window.confirm("이 기록을 삭제할까요?")) {
      deleteRecord(record.id);
      router.push("/");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="" backHref="/" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {record.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local data: URL, not a remote image
          <img
            src={record.photoUrl}
            alt=""
            className="aspect-[16/10] w-full rounded-xl object-cover"
          />
        )}

        <div>
          <h2 className="text-lg font-bold">{record.name}</h2>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-muted">
            <span className="rounded-full border border-border px-2 py-0.5 text-[9.5px]">
              {record.type}
            </span>
            <span className="font-mono">
              {formatDate(record.createdAt)} 기록
            </span>
          </div>
        </div>

        <StarRating value={record.rating} />

        <Block label="감각 태그">
          <div className="flex flex-wrap gap-1.5">
            {record.senseTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-1 text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </Block>

        <Block label="재구매 의사">
          <span className="inline-flex w-fit rounded-full bg-accent/15 px-2.5 py-1 text-[11.5px] font-bold text-accent">
            {record.repurchase}
          </span>
        </Block>

        <Block label="가격">
          <div className="text-[13px] font-semibold">
            ₩{record.price.toLocaleString()}
          </div>
        </Block>

        {record.memo && (
          <Block label="메모">
            <p className="text-[12.5px] leading-relaxed">{record.memo}</p>
          </Block>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          <Link
            href={`/records/${record.id}/edit`}
            className="flex-1 rounded-lg border border-border py-2.5 text-center text-[13px] font-semibold"
          >
            수정
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 rounded-lg border border-danger/50 py-2.5 text-[13px] font-semibold text-danger"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
        {label}
      </div>
      {children}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
