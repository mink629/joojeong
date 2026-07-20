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

  // Gemini의 mask base64는 종종 픽셀 데이터가 손상된 채로 온다(헤더/IEND는
  // 멀쩡해도 중간 압축 스트림이 깨짐). 마스크 합성이 실패해도 라벨 영역만
  // 잘라낸 bbox crop은 살려서, 원본 사진 전체로 폴백하는 것보다 낫게 한다.
  try {
    const maskResized = await sharp(segment.maskPng)
      .resize(boxWidth, boxHeight)
      .greyscale()
      .toBuffer();

    const cutout = await sharp(crop).joinChannel(maskResized).png().toBuffer();

    return await sharp(cutout).flatten({ background: "#ffffff" }).png().toBuffer();
  } catch (err) {
    console.error("mask compositing failed, using bbox crop only", err);
    return crop;
  }
}
