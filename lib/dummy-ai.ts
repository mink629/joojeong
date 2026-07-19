import type { RecognitionResult } from "./types";

/**
 * 유료 이미지 인식 API(Claude Vision 등) 없이 흐름을 검증하기 위한 더미 인식.
 * 3주종을 골고루 섞어둬서 주종별 감각 태그 세트가 실제로 갈아끼워지는지
 * 확인할 수 있게 한다. 과금 없이 쓸 수 있는 실제 API가 생기면 이 모듈을
 * 그 API 호출로 교체하면 된다.
 */
const DUMMY_POOL: Omit<RecognitionResult, "confidence">[] = [
  { brand: "글렌피딕", productName: "12년", type: "위스키" },
  { brand: "라프로익", productName: "10년", type: "위스키" },
  { brand: "발베니", productName: "더블우드 12년", type: "위스키" },
  { brand: "몬테스 알파", productName: "카베르네 소비뇽", type: "와인" },
  { brand: "끌로드 릴레", productName: "샤블리", type: "와인" },
  { brand: "배상면주가", productName: "대통령표 산사춘", type: "전통주" },
  { brand: "한산소곡주", productName: "명작", type: "전통주" },
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

export function recognizeLabel(): Promise<RecognitionResult> {
  const picked = pick(DUMMY_POOL);
  const confidence = pick(CONFIDENCE_POOL);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...picked, confidence }), 900);
  });
}
