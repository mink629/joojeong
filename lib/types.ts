export type TastingNotes = {
  aroma: string[];
  taste: string[];
  finish: string[];
  comment: string;
};

export type DrinkRecord = {
  id: string;
  name: string;
  brand: string;
  type: string;
  photoDataUrl: string | null;
  rating: number; // 1–5, 0 = 미입력
  price: string;
  createdAt: string; // ISO string
  tastingNotes?: TastingNotes;
};

export type AIResult = {
  brand: string;
  product_name: string;
  type: string;
  confidence: number;
};
