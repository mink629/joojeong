import { NextResponse } from "next/server";
import { segmentLabel } from "@/lib/gemini";
import { cutoutLabel } from "@/lib/imageMask";
import { extractText } from "@/lib/visionOcr";
import { structureLabelText } from "@/lib/structureText";
import type { RecognitionResult } from "@/lib/types";

/**
 * 1단계 Gemini(누끼 따기) → 2단계 Cloud Vision(OCR) → 3단계 텍스트 구조화
 * 파이프라인. 세그멘테이션이 실패하면 원본 사진 그대로 OCR을 시도해서
 * "라벨을 못 찾았다고 전체를 실패 처리"하지 않도록 한다.
 *
 * 3단계는 원래 Gemini로 했었지만, Gemini 무료 티어가 하루 20건이라
 * 사진 1장당 2콜(세그멘테이션+구조화)을 쓰면 하루 10장밖에 못 써서
 * 순수 텍스트 휴리스틱(lib/structureText.ts)으로 바꿔 1콜/장으로 줄였다.
 */
export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY || !process.env.GOOGLE_CLOUD_VISION_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY / GOOGLE_CLOUD_VISION_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let body: { image?: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { image, mediaType } = body;
  if (!image || !mediaType) {
    return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });
  }

  try {
    const originalBuffer = Buffer.from(image, "base64");

    const segment = await segmentLabel(image, mediaType);
    const ocrInput = segment
      ? await cutoutLabel(originalBuffer, segment).catch((err) => {
          console.error("cutoutLabel failed, falling back to original", err);
          return originalBuffer;
        })
      : originalBuffer;

    const ocrText = await extractText(ocrInput);
    const result: RecognitionResult = structureLabelText(ocrText);
    return NextResponse.json(result);
  } catch (err) {
    console.error("recognize pipeline error", err);
    return NextResponse.json({ error: "인식 처리에 실패했습니다." }, { status: 502 });
  }
}
