"use client";

import { useState, type ReactNode } from "react";
import { StarRating } from "./StarRating";
import { TagSelect } from "./TagSelect";
import { Segmented } from "./Segmented";
import { SENSE_TAGS } from "@/lib/senseTags";
import type { DrinkType, Repurchase } from "@/lib/types";

export interface RecordFormValues {
  name: string;
  brand: string;
  type: DrinkType;
  photoUrl: string;
  rating: number;
  senseTags: string[];
  repurchase: Repurchase;
  price: number | "";
  memo: string;
}

export function RecordForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial: RecordFormValues;
  onSubmit: (values: RecordFormValues) => void;
  submitLabel: string;
}) {
  const [values, setValues] = useState(initial);
  const tagOptions = SENSE_TAGS[values.type] ?? [];

  function update<K extends keyof RecordFormValues>(
    key: K,
    val: RecordFormValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  const canSave =
    values.rating > 0 &&
    values.senseTags.length > 0 &&
    values.price !== "" &&
    Number(values.price) >= 0;

  return (
    <div className="flex flex-1 flex-col gap-5 p-4">
      <div className="rounded-lg border border-dashed border-border bg-hatch px-3 py-2.5">
        <div className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
          이름 / 브랜드
        </div>
        <input
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full bg-transparent text-[13px] font-semibold outline-none"
        />
      </div>

      <Field label="별점">
        <StarRating
          value={values.rating}
          onChange={(v) => update("rating", v)}
          size="lg"
        />
      </Field>

      <Field label={`감각 태그 · ${values.type} (다중 선택)`}>
        <TagSelect
          options={tagOptions}
          value={values.senseTags}
          onChange={(v) => update("senseTags", v)}
        />
      </Field>

      <Field label="재구매 의사">
        <Segmented<Repurchase>
          options={[
            { label: "재구매함", value: "재구매함" },
            { label: "보통", value: "보통" },
            { label: "비추천", value: "비추천" },
          ]}
          value={values.repurchase}
          onChange={(v) => update("repurchase", v)}
        />
      </Field>

      <Field label="가격">
        <div className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5">
          <span className="text-ink-muted">₩</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={values.price}
            onChange={(e) =>
              update(
                "price",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder="0"
            className="w-full bg-transparent text-[13px] outline-none"
          />
        </div>
      </Field>

      <Field label="메모 (선택)">
        <textarea
          value={values.memo}
          onChange={(e) => update("memo", e.target.value)}
          placeholder="예: 스모키한 향은 약하고 바닐라·꿀 향이 진함"
          rows={3}
          className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-[13px] outline-none placeholder:text-ink-muted"
        />
      </Field>

      <button
        type="button"
        disabled={!canSave}
        onClick={() => onSubmit(values)}
        className="mt-2 rounded-lg bg-accent py-3 text-[13.5px] font-bold text-accent-ink disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
        {label}
      </div>
      {children}
    </div>
  );
}
