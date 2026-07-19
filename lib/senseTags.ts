import type { DrinkType } from "./types";

/**
 * PRD 8절 감각 태그 마스터 초안. M2~M3 사이 검증/확정 예정이라
 * 와인/전통주 세트도 데이터는 미리 담아두되, SUPPORTED_TYPES로
 * M1에서는 위스키만 선택 가능하도록 잠가둔다.
 */
export const SENSE_TAGS: Record<DrinkType, string[]> = {
  위스키: [
    "🍯 달콤함(꿀/카라멜/바닐라)",
    "🔥 스모키(피트/훈연)",
    "🌰 고소함(견과/곡물)",
    "🍋 과일향(시트러스/사과)",
    "🌶️ 스파이시",
    "🪵 나무향(오크)",
    "🍫 진한바디감",
  ],
  와인: [
    "🍇 과일향(베리/말린과일)",
    "🌸 꽃향",
    "🍷 드라이함(탄닌/떫음)",
    "🍋 상큼함(산미)",
    "🌶️ 스파이시(후추)",
    "🪵 나무향(오크)",
    "🪨 흙내음(미네랄)",
  ],
  전통주: [
    "🌾 누룩향(곡물 발효향)",
    "🍚 구수함(쌀/곡물)",
    "🍯 단맛",
    "🍋 상큼함(과실/산미)",
    "✨ 청량함(탄산/가벼움)",
    "🫧 묵직함(바디감)",
    "😋 새콤함(발효산미)",
  ],
};

export const SUPPORTED_TYPES: DrinkType[] = ["위스키"];

export const ALL_TYPES: DrinkType[] = ["위스키", "와인", "전통주"];

export function isSupportedType(type: DrinkType): boolean {
  return SUPPORTED_TYPES.includes(type);
}
