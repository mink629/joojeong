import type { RecognitionResult } from "./types";

/**
 * 서버의 /api/recognize(Claude 비전)를 호출한다.
 * 네트워크 오류, API 오류, 응답 파싱 실패는 전부 null로 뭉뚱그려
 * 호출부가 "자동 인식 실패 → 직접 입력" 한 경로로만 처리하면 되게 한다.
 */
export async function recognizeLabel(
  photo: File
): Promise<RecognitionResult | null> {
  try {
    const { data, mediaType } = await fileToBase64(photo);
    const res = await fetch("/api/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: data, mediaType }),
    });
    if (!res.ok) return null;
    return (await res.json()) as RecognitionResult;
  } catch {
    return null;
  }
}

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const data = result.slice(result.indexOf(",") + 1);
      resolve({ data, mediaType: file.type || "image/jpeg" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
