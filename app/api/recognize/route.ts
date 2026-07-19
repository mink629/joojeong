import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { RecognitionResult } from "@/lib/types";

const RECOGNITION_PROMPT = `이 이미지는 술(위스키/와인/전통주) 라벨 사진이다.
라벨에서 브랜드명과 제품명, 주종을 추출해서 report_recognition 도구로 보고해라.

규칙:
- 확신이 없으면 confidence를 "낮음"으로 낮추고, 브랜드/제품명을 추측해서 지어내지 말고 빈 문자열로 남겨라.
- 주종 판별이 애매하면(예: 증류식 소주 vs 위스키) type을 null로 반환해서 사용자가 직접 고르게 하라.
- 라벨이 아예 보이지 않거나 술 라벨이 아니면 brand/product_name을 빈 문자열로, type을 null로, confidence를 "낮음"으로 반환해라.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
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

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 300,
      tools: [
        {
          name: "report_recognition",
          description:
            "라벨 사진에서 인식한 브랜드/제품명/주종/확신도를 보고한다.",
          input_schema: {
            type: "object",
            properties: {
              brand: {
                type: "string",
                description: "브랜드명. 모르면 빈 문자열.",
              },
              product_name: {
                type: "string",
                description: "제품명. 모르면 빈 문자열.",
              },
              type: {
                type: ["string", "null"],
                enum: ["위스키", "와인", "전통주", null],
                description: "주종. 애매하면 null.",
              },
              confidence: {
                type: "string",
                enum: ["낮음", "보통", "높음"],
              },
            },
            required: ["brand", "product_name", "type", "confidence"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "report_recognition" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/webp"
                  | "image/gif",
                data: image,
              },
            },
            { type: "text", text: RECOGNITION_PROMPT },
          ],
        },
      ],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "인식 결과가 없습니다." }, { status: 502 });
    }

    const input = toolUse.input as {
      brand: string;
      product_name: string;
      type: string | null;
      confidence: string;
    };

    const type =
      input.type === "위스키" || input.type === "와인" || input.type === "전통주"
        ? input.type
        : null;
    const confidence =
      input.confidence === "높음" || input.confidence === "낮음"
        ? input.confidence
        : "보통";

    const result: RecognitionResult = {
      brand: input.brand ?? "",
      productName: input.product_name ?? "",
      type,
      confidence,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("recognize API error", err);
    return NextResponse.json(
      { error: "인식 API 호출에 실패했습니다." },
      { status: 502 }
    );
  }
}
