"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRecord, deleteRecord } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import type { DrinkRecord } from "@/lib/types";
import { StarDisplay } from "@/components/star";

export default function RecordDetailPage({ params }: PageProps<"/records/[id]">) {
  const { id } = use(params);
  const router = useRouter();
  const [record, setRecord] = useState<DrinkRecord | null | undefined>(undefined);

  useEffect(() => {
    setRecord(getRecord(id) ?? null);
  }, [id]);

  if (record === undefined) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        불러오는 중...
      </div>
    );
  }

  if (record === null) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <p className="text-sm">기록을 찾을 수 없어요</p>
        <Link href="/" className="text-sm text-gray-900 underline underline-offset-2">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (!confirm("이 기록을 삭제할까요?")) return;
    trackEvent("기록 삭제", { recordId: record.id });
    deleteRecord(record.id);
    router.push("/");
  };

  const tn = record.tastingNotes;
  const hasTastingTags =
    tn && (tn.aroma.length > 0 || tn.taste.length > 0 || tn.finish.length > 0);
  const hasTastingNote = hasTastingTags || (tn && tn.comment);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" className="text-gray-400 hover:text-gray-900 text-sm">
          ← 목록
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/records/${record.id}/edit`}
            onClick={() => trackEvent("기록 수정 클릭", { recordId: record.id })}
            className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 border border-gray-200 rounded-lg transition-colors"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            삭제
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {record.photoDataUrl ? (
          <div className="bg-gray-50 max-h-56 overflow-hidden flex items-center justify-center">
            <img
              src={record.photoDataUrl}
              alt={record.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="bg-gray-50 h-32 flex items-center justify-center text-4xl text-gray-200">
            🍾
          </div>
        )}

        <div className="flex flex-col gap-5 px-4 py-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{record.name}</h2>
            {(record.brand || record.type) && (
              <p className="text-sm text-gray-500 mt-1">
                {[record.brand, record.type].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          {record.rating > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide">별점</span>
              <StarDisplay rating={record.rating} />
            </div>
          )}

          {record.price && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wide">가격</span>
              <span className="text-sm">{record.price}</span>
            </div>
          )}

          {hasTastingNote && (
            <>
              <hr className="border-gray-100" />
              <div className="flex flex-col gap-4">
                <span className="text-xs text-gray-400 uppercase tracking-wide">테이스팅 노트</span>

                {tn!.aroma.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500">향</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tn!.aroma.map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tn!.taste.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500">맛</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tn!.taste.map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tn!.finish.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500">피니시</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tn!.finish.map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tn!.comment && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">코멘트</span>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {tn!.comment}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wide">기록일</span>
            <span className="text-sm text-gray-500">
              {new Date(record.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
