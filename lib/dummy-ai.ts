import type { AIResult } from "./types";

// M1: 더미 응답. M2에서 Claude API로 교체.
const DUMMY_RESULTS: AIResult[] = [
  { brand: "Glenfarclas", product_name: "Glenfarclas 105", type: "Scotch Whisky", confidence: 0.92 },
  { brand: "Nikka", product_name: "Nikka From the Barrel", type: "Japanese Whisky", confidence: 0.88 },
  { brand: "Ardbeg", product_name: "Ardbeg Uigeadail", type: "Islay Single Malt", confidence: 0.95 },
  { brand: "Suntory", product_name: "Hibiki Harmony", type: "Japanese Blended Whisky", confidence: 0.90 },
];

export async function recognizeLabel(_file: File): Promise<AIResult | null> {
  await new Promise((r) => setTimeout(r, 1500));

  // 10% 확률로 인식 실패 시뮬레이션
  if (Math.random() < 0.1) return null;

  return DUMMY_RESULTS[Math.floor(Math.random() * DUMMY_RESULTS.length)];
}
