export type DrinkType = "위스키" | "와인" | "전통주";

export type Repurchase = "재구매함" | "보통" | "비추천";

export interface TastingRecord {
  id: string;
  name: string;
  brand: string;
  type: DrinkType;
  photoUrl: string;
  rating: number;
  senseTags: string[];
  repurchase: Repurchase;
  price: number;
  memo?: string;
  createdAt: string;
}

export interface RecognitionResult {
  brand: string;
  productName: string;
  type: DrinkType;
  confidence: "낮음" | "보통" | "높음";
}
