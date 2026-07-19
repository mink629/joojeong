"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoPicker } from "@/components/PhotoPicker";
import { RecordForm } from "@/components/RecordForm";
import { TopBar } from "@/components/TopBar";
import { recognizeLabel } from "@/lib/recognize";
import { createRecord } from "@/lib/storage";
import { ALL_TYPES } from "@/lib/senseTags";
import type { DrinkType, RecognitionResult } from "@/lib/types";

type Step = "photo" | "recognizing" | "confirm" | "form";

export default function NewRecordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("photo");
  const [photoUrl, setPhotoUrl] = useState("");
  const [confidence, setConfidence] =
    useState<RecognitionResult["confidence"]>("보통");
  const [recognitionFailed, setRecognitionFailed] = useState(false);
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [confirmedType, setConfirmedType] = useState<DrinkType | null>(null);

  async function handlePick(file: File) {
    const url = await readAsDataUrl(file);
    setPhotoUrl(url);
    setStep("recognizing");

    const result = await recognizeLabel(file);
    if (result) {
      setBrand(result.brand);
      setProductName(result.productName);
      setConfirmedType(result.type);
      setConfidence(result.confidence);
      setRecognitionFailed(false);
    } else {
      setBrand("");
      setProductName("");
      setConfirmedType(null);
      setRecognitionFailed(true);
    }
    setStep("confirm");
  }

  if (step === "photo") {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="기록 만들기" backHref="/" />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <PhotoPicker onPick={handlePick} />
          <p className="text-center text-[11.5px] text-ink-muted">
            라벨이 잘 보이도록 촬영하면 브랜드·주종을 자동으로 인식해요.
          </p>
        </div>
      </div>
    );
  }

  if (step === "recognizing") {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="기록 만들기" onBack={() => setStep("photo")} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- local data: URL preview, not a remote image
            <img
              src={photoUrl}
              alt=""
              className="h-40 w-40 rounded-xl object-cover opacity-60"
            />
          )}
          <p className="text-[13px] text-ink-muted">라벨을 분석하고 있어요…</p>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    const canProceed =
      confirmedType !== null && (brand.trim() !== "" || productName.trim() !== "");

    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="기록 만들기" onBack={() => setStep("photo")} />
        <div className="flex flex-1 flex-col gap-4 p-4">
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- local data: URL preview, not a remote image
            <img
              src={photoUrl}
              alt="업로드한 라벨 사진"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
          )}

          {recognitionFailed ? (
            <p className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-ink-muted">
              자동 인식에 실패했어요. 이름과 주종을 직접 입력해주세요.
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
                AI 인식 결과
              </div>
              <span className="rounded-full border border-border bg-hatch px-2 py-0.5 text-[10.5px] text-ink-muted">
                확신도 {confidence}
              </span>
            </div>
          )}

          <LabeledInput label="브랜드" value={brand} onChange={setBrand} placeholder="예: 글렌피딕" />
          <LabeledInput
            label="제품명"
            value={productName}
            onChange={setProductName}
            placeholder="예: 12년"
          />

          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-muted">
              주종 확인 / 수정
            </div>
            <div className="flex gap-1.5">
              {ALL_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setConfirmedType(type)}
                  className={`flex-1 rounded-lg border py-2 text-[12px] ${
                    confirmedType === type
                      ? "border-accent font-bold text-accent"
                      : "border-border text-ink-muted"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {confirmedType === null && (
              <p className="mt-1.5 text-[11px] text-danger">주종을 선택해주세요.</p>
            )}
          </div>

          <button
            type="button"
            disabled={!canProceed}
            onClick={() => setStep("form")}
            className="mt-auto rounded-lg bg-accent py-3 text-[13.5px] font-bold text-accent-ink disabled:opacity-40"
          >
            확인하고 기록 작성하기
          </button>
        </div>
      </div>
    );
  }

  if (step === "form" && confirmedType) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="기록 작성" onBack={() => setStep("confirm")} />
        <RecordForm
          initial={{
            name: `${brand} ${productName}`.trim(),
            brand,
            type: confirmedType,
            photoUrl,
            rating: 0,
            senseTags: [],
            repurchase: "보통",
            price: "",
            memo: "",
          }}
          submitLabel="저장"
          onSubmit={(values) => {
            createRecord({
              ...values,
              price: Number(values.price),
            });
            router.push("/");
          }}
        />
      </div>
    );
  }

  return null;
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-border px-3 py-2.5 text-[13px] outline-none placeholder:text-ink-muted"
      />
    </label>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
