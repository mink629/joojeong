"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PhotoPicker } from "@/components/PhotoPicker";
import { RecordForm } from "@/components/RecordForm";
import { TopBar } from "@/components/TopBar";
import { recognizeLabel } from "@/lib/dummy-ai";
import { createRecord } from "@/lib/storage";
import { SUPPORTED_TYPES } from "@/lib/senseTags";
import type { DrinkType, RecognitionResult } from "@/lib/types";

type Step = "photo" | "recognizing" | "confirm" | "form";

export default function NewRecordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("photo");
  const [photoUrl, setPhotoUrl] = useState("");
  const [recognition, setRecognition] = useState<RecognitionResult | null>(
    null
  );
  const [confirmedType, setConfirmedType] = useState<DrinkType>("위스키");

  async function handlePick(file: File) {
    const url = await readAsDataUrl(file);
    setPhotoUrl(url);
    setStep("recognizing");
    const result = await recognizeLabel(file);
    setRecognition(result);
    setConfirmedType(result.type);
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

  if (step === "confirm" && recognition) {
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

          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-muted">
              AI 인식 결과 (더미)
            </div>
            <div className="flex flex-col divide-y divide-dashed divide-border rounded-lg border border-border px-3">
              <Row k="브랜드" v={recognition.brand} />
              <Row k="제품명" v={recognition.productName} />
              <Row k="확신도" v={recognition.confidence} pill />
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-muted">
              주종 확인 / 수정
            </div>
            <div className="flex gap-1.5">
              {(["위스키", "와인", "전통주"] as DrinkType[]).map((type) => {
                const locked = !SUPPORTED_TYPES.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={locked}
                    onClick={() => setConfirmedType(type)}
                    className={`flex-1 rounded-lg border py-2 text-[12px] ${
                      locked
                        ? "cursor-not-allowed border-border text-ink-muted/50"
                        : confirmedType === type
                          ? "border-accent font-bold text-accent"
                          : "border-border text-ink-muted"
                    }`}
                  >
                    {type}
                    {locked && (
                      <span className="ml-1 font-mono text-[9px]">M2</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="rounded-lg border border-dashed border-border p-3 text-[11px] leading-relaxed text-ink-muted">
            인식이 잘 안 됐다면 다음 화면에서 이름을 직접 고쳐 저장할 수
            있어요.
          </p>

          <button
            type="button"
            onClick={() => setStep("form")}
            className="mt-auto rounded-lg bg-accent py-3 text-[13.5px] font-bold text-accent-ink"
          >
            확인하고 기록 작성하기
          </button>
        </div>
      </div>
    );
  }

  if (step === "form" && recognition) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="기록 작성" onBack={() => setStep("confirm")} />
        <RecordForm
          initial={{
            name: `${recognition.brand} ${recognition.productName}`,
            brand: recognition.brand,
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

function Row({ k, v, pill }: { k: string; v: string; pill?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 text-[12.5px]">
      <span className="text-ink-muted">{k}</span>
      {pill ? (
        <span className="rounded-full border border-border bg-hatch px-2 py-0.5 text-[10.5px] text-ink-muted">
          {v}
        </span>
      ) : (
        <span className="font-semibold">{v}</span>
      )}
    </div>
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
