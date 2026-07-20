import { GoogleGenAI } from "@google/genai";

function client(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/** 1단계: 사진에서 술 라벨만 잘라내기 위한 세그멘테이션(누끼) 결과. */
export interface LabelSegment {
  /** 정규화 좌표 [y0, x0, y1, x1], 0~1000 스케일 (Gemini 세그멘테이션 규격) */
  box: [number, number, number, number];
  maskPng: Buffer;
}

const SEGMENTATION_PROMPT = `이 사진에서 술병(위스키/와인/전통주)의 라벨 부분만 찾아라.
라벨을 찾을 수 없으면 빈 배열 []을 반환해라.
찾으면 JSON 배열을 반환하되, 가장 크고 뚜렷한 라벨 하나만 포함하고, 각 항목은
"box_2d"(정규화된 [y0,x0,y1,x1], 0~1000 스케일), "mask"(base64 PNG 세그멘테이션 마스크),
"label" 키를 가진 객체로 구성해라.`;

export async function segmentLabel(
  imageBase64: string,
  mediaType: string
): Promise<LabelSegment | null> {
  const ai = client();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: mediaType, data: imageBase64 } },
            { text: SEGMENTATION_PROMPT },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    const raw = response.text?.trim();
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Array<{
      box_2d?: [number, number, number, number];
      mask?: string;
    }>;
    const first = parsed[0];
    if (!first?.mask || !first?.box_2d) return null;

    const base64Data = first.mask.includes(",")
      ? first.mask.slice(first.mask.indexOf(",") + 1)
      : first.mask;

    return { box: first.box_2d, maskPng: Buffer.from(base64Data, "base64") };
  } catch (err) {
    console.error("segmentLabel error", err);
    return null;
  }
}
