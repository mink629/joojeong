import type { RecognitionResult } from "./types";

/**
 * M1은 실제 이미지 인식 API 대신 더미 데이터로 흐름만 검증한다.
 * (PRD 6절: 라벨 이미지 → { brand, product_name, type, confidence } / M2에서 실제 API로 교체)
 */
const DUMMY_POOL: Omit<RecognitionResult, "confidence">[] = [
  { brand: "글렌피딕", productName: "12년", type: "위스키" },
  { brand: "라프로익", productName: "10년", type: "위스키" },
  { brand: "발베니", productName: "더블우드 12년", type: "위스키" },
  { brand: "맥캘란", productName: "12년 셰리오크", type: "위스키" },
];

const CONFIDENCE_POOL: RecognitionResult["confidence"][] = [
  "보통",
  "높음",
  "보통",
  "낮음",
];

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature mirrors the real recognition API this will call in M2
export function recognizeLabel(photo: File): Promise<RecognitionResult> {
  const picked = pick(DUMMY_POOL);
  const confidence = pick(CONFIDENCE_POOL);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...picked, confidence }), 900);
  });
}
