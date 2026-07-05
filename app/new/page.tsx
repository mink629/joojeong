"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recognizeLabel } from "@/lib/dummy-ai";
import { saveRecord } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { TASTING_TAGS } from "@/lib/tasting";
import type { AIResult } from "@/lib/types";
import { StarInput } from "@/components/star";
import { TagSelect } from "@/components/tag-select";

type Step = "upload" | "nukki" | "recognize" | "form";

const INPUT =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900";
const BTN_PRIMARY =
  "w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors";

function Header({
  title,
  onBack,
  backHref,
}: {
  title: string;
  onBack?: () => void;
  backHref?: string;
}) {
  return (
    <header className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
      {onBack ? (
        <button onClick={onBack} className="text-gray-400 hover:text-gray-900">
          ←
        </button>
      ) : backHref ? (
        <Link href={backHref} className="text-gray-400 hover:text-gray-900">
          ←
        </Link>
      ) : (
        <div className="w-4" />
      )}
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}

export default function NewPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [nukkiDone, setNukkiDone] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [recognizeFailed, setRecognizeFailed] = useState(false);

  // 기본 정보
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState("");

  // 테이스팅 노트
  const [aroma, setAroma] = useState<string[]>([]);
  const [taste, setTaste] = useState<string[]>([]);
  const [finish, setFinish] = useState<string[]>([]);
  const [tastingComment, setTastingComment] = useState("");

  const [saving, setSaving] = useState(false);

  // 누끼 1.5초 더미 처리
  useEffect(() => {
    if (step !== "nukki") return;
    const timer = setTimeout(() => setNukkiDone(true), 1500);
    return () => clearTimeout(timer);
  }, [step]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoDataUrl(ev.target?.result as string);
      setNukkiDone(false);
      setStep("nukki");
    };
    reader.readAsDataURL(file);
  };

  const handleNukkiNext = async () => {
    if (!currentFile) return;
    trackEvent("라벨 인식 다음 클릭");
    setStep("recognize");
    setIsRecognizing(true);
    try {
      const result = await recognizeLabel(currentFile);
      if (result) {
        setAiResult(result);
        setRecognizeFailed(false);
      } else {
        setRecognizeFailed(true);
      }
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleNextFromRecognize = () => {
    trackEvent("인식 결과 다음 클릭");
    if (aiResult) {
      setName(aiResult.product_name);
      setBrand(aiResult.brand);
      setType(aiResult.type);
    }
    setStep("form");
  };

  const handleSave = () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    trackEvent("기록 저장 클릭", { rating, hasPhoto: !!photoDataUrl });
    saveRecord({
      id: crypto.randomUUID(),
      name: name.trim(),
      brand: brand.trim(),
      type: type.trim(),
      photoDataUrl,
      rating,
      price: price.trim(),
      createdAt: new Date().toISOString(),
      tastingNotes: { aroma, taste, finish, comment: tastingComment.trim() },
    });
    router.push("/");
  };

  // ── Step: upload ──
  if (step === "upload") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="새 기록" backHref="/" />
        <main className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <p className="text-gray-500 text-sm text-center">
            라벨 사진을 찍으면 이름과 브랜드를
            <br />
            자동으로 인식해 드릴게요.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => {
              trackEvent("사진 촬영/업로드 클릭");
              fileInputRef.current?.click();
            }}
            className={`${BTN_PRIMARY} max-w-xs`}
          >
            📷 사진 촬영 / 업로드
          </button>
        </main>
      </div>
    );
  }

  // ── Step: nukki ──
  if (step === "nukki") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header
          title="배경 제거"
          onBack={() => {
            setStep("upload");
            setPhotoDataUrl(null);
            setCurrentFile(null);
          }}
        />
        <main className="flex-1 flex flex-col px-4 py-6 gap-5">
          {!nukkiDone ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              {photoDataUrl && (
                <div className="w-28 h-36 rounded-xl overflow-hidden opacity-40 blur-sm">
                  <img
                    src={photoDataUrl}
                    alt="처리 중"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">배경을 제거하는 중...</p>
            </div>
          ) : (
            <>
              {/* 체커보드 + 누끼 결과 */}
              <div
                className="rounded-xl overflow-hidden relative flex items-center justify-center"
                style={{
                  background:
                    "repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 16px 16px",
                  minHeight: "200px",
                }}
              >
                {photoDataUrl && (
                  <img
                    src={photoDataUrl}
                    alt="누끼 결과"
                    className="max-h-52 w-full object-contain"
                  />
                )}
                <span className="absolute top-2 right-2 bg-white/90 text-xs text-green-600 font-semibold px-2 py-1 rounded-full border border-green-200">
                  ✓ 누끼 완료
                </span>
              </div>
              <p className="text-xs text-gray-400 text-center">
                다음 단계에서 라벨 정보를 자동 인식해요
              </p>
              <button onClick={handleNukkiNext} className={BTN_PRIMARY}>
                다음 — 라벨 인식
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  // ── Step: recognize ──
  if (step === "recognize") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="라벨 인식" onBack={() => setStep("nukki")} />
        <main className="flex-1 flex flex-col px-4 py-6 gap-5">
          {photoDataUrl && (
            <div className="rounded-xl overflow-hidden bg-gray-100 max-h-52">
              <img
                src={photoDataUrl}
                alt="라벨 사진"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {isRecognizing && (
            <div className="flex flex-col items-center py-6 gap-2 text-gray-400">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              <p className="text-sm">라벨을 인식하는 중...</p>
            </div>
          )}

          {!isRecognizing && aiResult && (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide">인식 결과</p>
                <div className="grid grid-cols-[5rem_1fr] gap-y-2 text-sm">
                  <span className="text-gray-400">브랜드</span>
                  <span className="font-medium">{aiResult.brand}</span>
                  <span className="text-gray-400">제품명</span>
                  <span className="font-medium">{aiResult.product_name}</span>
                  <span className="text-gray-400">종류</span>
                  <span className="font-medium">{aiResult.type}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                다음 단계에서 수정할 수 있어요
              </p>
              <button onClick={handleNextFromRecognize} className={BTN_PRIMARY}>
                다음
              </button>
            </div>
          )}

          {!isRecognizing && recognizeFailed && (
            <div className="flex flex-col gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  자동인식이 어려워요, 직접 입력해주세요
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="제품명" className={INPUT} />
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="브랜드" className={INPUT} />
                <input value={type} onChange={(e) => setType(e.target.value)} placeholder="종류 (예: Scotch Whisky)" className={INPUT} />
              </div>
              <button onClick={() => setStep("form")} className={BTN_PRIMARY}>
                다음
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ── Step: form ──
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="기록 작성" onBack={() => setStep("recognize")} />
      <main className="flex-1 flex flex-col px-4 py-6 gap-5 pb-12">

        {/* 기본 정보 */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">기본 정보 — 수정 가능</p>
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

        {/* 평가 */}
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
