import sharp from "sharp";
import type { LabelSegment } from "./gemini";

/**
 * Gemini 세그멘테이션 결과(box_2d + mask)를 원본 사진에 적용해
 * 라벨 영역만 흰 배경에 합성한 PNG를 만든다 ("누끼 따기").
 * OCR은 실제 렌더링된 픽셀이 필요하므로 투명 대신 흰 배경으로 flatten한다.
 */
export async function cutoutLabel(
  originalBuffer: Buffer,
  segment: LabelSegment
): Promise<Buffer> {
  const meta = await sharp(originalBuffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (!width || !height) {
    throw new Error("이미지 크기를 읽을 수 없습니다.");
  }

  const [y0, x0, y1, x1] = segment.box;
  const left = Math.max(0, Math.round((x0 / 1000) * width));
  const top = Math.max(0, Math.round((y0 / 1000) * height));
  const right = Math.min(width, Math.round((x1 / 1000) * width));
  const bottom = Math.min(height, Math.round((y1 / 1000) * height));
  const boxWidth = Math.max(1, right - left);
  const boxHeight = Math.max(1, bottom - top);

  const crop = await sharp(originalBuffer)
    .extract({ left, top, width: boxWidth, height: boxHeight })
    .removeAlpha()
    .toBuffer();

  const maskResized = await sharp(segment.maskPng)
    .resize(boxWidth, boxHeight)
    .greyscale()
    .toBuffer();

  const cutout = await sharp(crop).joinChannel(maskResized).png().toBuffer();

  return sharp(cutout).flatten({ background: "#ffffff" }).png().toBuffer();
}
