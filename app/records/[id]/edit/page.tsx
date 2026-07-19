"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RecordForm } from "@/components/RecordForm";
import { TopBar } from "@/components/TopBar";
import { getRecord, updateRecord } from "@/lib/storage";
import type { TastingRecord } from "@/lib/types";

export default function EditRecordPage() {
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

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="기록 수정" backHref={`/records/${record.id}`} />
      <RecordForm
        initial={{
          name: record.name,
          brand: record.brand,
          type: record.type,
          photoUrl: record.photoUrl,
          rating: record.rating,
          senseTags: record.senseTags,
          repurchase: record.repurchase,
          price: record.price,
          memo: record.memo ?? "",
        }}
        submitLabel="수정 완료"
        onSubmit={(values) => {
          updateRecord(record.id, { ...values, price: Number(values.price) });
          router.push(`/records/${record.id}`);
        }}
      />
    </div>
  );
}
