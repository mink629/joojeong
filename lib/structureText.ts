import type { DrinkType, RecognitionResult } from "./types";

/**
 * Cloud Vision OCR 원문을 브랜드/제품명/주종으로 구조화한다.
 * Gemini 무료 티어가 하루 20건(사진 1장당 2콜 필요)이라 두 번째 Gemini
 * 호출을 없애기 위해 순수 텍스트 휴리스틱으로 대체했다 — 의미 이해는
 * Gemini보다 떨어지지만, 라벨은 보통 첫 줄이 브랜드인 경우가 많고
 * confidence를 "보통" 이하로 낮춰서 사용자가 확인/수정하게 한다.
 */

const TYPE_KEYWORDS: Record<DrinkType, string[]> = {
  위스키: [
    "whisky",
    "whiskey",
    "single malt",
    "blended",
    "bourbon",
    "scotch",
    "rye",
    "distillery",
    "위스키",
    "싱글몰트",
    "블렌디드",
  ],
  와인: [
    "wine",
    "vin ",
    "vino",
    "cabernet",
    "chardonnay",
    "merlot",
    "pinot",
    "sauvignon",
    "syrah",
    "shiraz",
    "riesling",
    "vineyard",
    "chateau",
    "domaine",
    "와인",
    "빈티지",
  ],
  전통주: [
    "막걸리",
    "소주",
    "청주",
    "약주",
    "증류주",
    "탁주",
    "전통주",
    "동동주",
    "과실주",
  ],
};

function detectType(text: string): DrinkType | null {
  const lower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS) as [
    DrinkType,
    string[],
  ][]) {
    if (keywords.some((kw) => lower.includes(kw))) return type;
  }
  return null;
}

// 도수/용량/생산년도 등 브랜드·제품명이 아닌 흔한 라벨 문구는 후보에서 뺀다.
const NOISE_LINE = /^\s*(\d{1,3}(\.\d+)?\s*%|\d{2,4}\s*m?l|19\d{2}|20\d{2})\s*$/i;

export function structureLabelText(ocrText: string): RecognitionResult {
  const lines = ocrText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !NOISE_LINE.test(l));

  if (lines.length === 0) {
    return { brand: "", productName: "", type: null, confidence: "낮음" };
  }

  const type = detectType(ocrText);
  const brand = lines[0];
  const productName = lines.slice(1, 4).join(" ").trim();

  return {
    brand,
    productName,
    type,
    confidence: type && lines.length > 1 ? "보통" : "낮음",
  };
}
