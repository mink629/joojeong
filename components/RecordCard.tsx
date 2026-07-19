import Link from "next/link";
import type { TastingRecord } from "@/lib/types";
import { StarRating } from "./StarRating";

export function RecordCard({ record }: { record: TastingRecord }) {
  return (
    <Link
      href={`/records/${record.id}`}
      className="flex gap-3 rounded-xl border border-border p-3 transition-colors active:bg-hatch"
    >
      <div className="h-14 w-14 flex-none overflow-hidden rounded-lg border border-border bg-hatch">
        {record.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- data: URL from localStorage, not an optimizable remote image
          <img
            src={record.photoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-bold">
            {record.name}
          </span>
          <span className="flex-none rounded-full border border-border px-2 py-0.5 text-[9.5px] text-ink-muted">
            {record.type}
          </span>
        </div>
        <StarRating value={record.rating} size="sm" />
        <div className="flex flex-wrap gap-1">
          {record.senseTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 text-[9.5px] text-ink-muted"
            >
              {tag.replace(/^\S+\s/, "")}
            </span>
          ))}
        </div>
        <div className="font-mono text-[10.5px] text-ink-muted">
          ₩{record.price.toLocaleString()} · {record.repurchase}
        </div>
      </div>
    </Link>
  );
}
