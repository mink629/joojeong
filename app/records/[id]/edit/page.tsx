"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRecord, saveRecord } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { TASTING_TAGS } from "@/lib/tasting";
import type { DrinkRecord } from "@/lib/types";
import { StarInput } from "@/components/star";
import { TagSelect } from "@/components/tag-select";

const INPUT =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900";
const BTN_PRIMARY =
  "w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [record, setRecord] = useState<DrinkRecord | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState("");
  const [aroma, setAroma] = useState<string[]>([]);
  const [taste, setTaste] = useState<string[]>([]);
  const [finish, setFinish] = useState<string[]>([]);
  const [tastingComment, setTastingComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const r = getRecord(id);
    if (!r) { setRecord(null); return; }
    setRecord(r);
    setName(r.name);
    setBrand(r.brand);
    setType(r.type);
    setRating(r.rating);
    setPrice(r.price);
    if (r.tastingNotes) {
      setAroma(r.tastingNotes.aroma);
      setTaste(r.tastingNotes.taste);
      setFinish(r.tastingNotes.finish);
      setTastingComment(r.tastingNotes.comment);
    }
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

  const handleSave = () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    trackEvent("기록 수정 저장 클릭", { recordId: id });
    saveRecord({
      ...record,
      name: name.trim(),
      brand: brand.trim(),
      type: type.trim(),
      rating,
      price: price.trim(),
      tastingNotes: { aroma, taste, finish, comment: tastingComment.trim() },
    });
    router.push(`/records/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <Link href={`/records/${id}`} className="text-gray-400 hover:text-gray-900">
          ←
        </Link>
        <h1 className="text-lg font-semibold">수정</h1>
      </header>

      <main className="flex-1 flex flex-col px-4 py-6 gap-5 pb-12">

        {/* 기본 정보 */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              제품명 <span className="text-red-400">*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="제품명을 입력하세요" className={INPUT} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">브랜드</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="브랜드" className={INPUT} />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">종류</label>
              <input value={type} onChange={(e) => setType(e.target.value)} placeholder="종류" className={INPUT} />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">별점</label>
          <StarInput value={rating} onChange={setRating} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">가격</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="예: 58,000원" className={INPUT} />
        </div>

        <hr className="border-gray-100" />

        {/* 테이스팅 노트 */}
        <div className="flex flex-col gap-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">테이스팅 노트</p>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">향 (Aroma)</label>
            <TagSelect options={TASTING_TAGS.aroma} selected={aroma} onChange={setAroma} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">맛 (Taste)</label>
            <TagSelect options={TASTING_TAGS.taste} selected={taste} onChange={setTaste} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">피니시 (Finish)</label>
            <TagSelect options={TASTING_TAGS.finish} selected={finish} onChange={setFinish} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">코멘트</label>
            <textarea
              value={tastingComment}
              onChange={(e) => setTastingComment(e.target.value)}
              placeholder="향, 맛, 피니시에 대한 감상을 자유롭게 적어보세요"
              rows={3}
              className={`${INPUT} resize-none`}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className={`${BTN_PRIMARY} disabled:opacity-40 disabled:cursor-not-allowed mt-2`}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </main>
    </div>
  );
}
