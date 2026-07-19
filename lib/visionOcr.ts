/**
 * 2단계: 누끼 딴 라벨 이미지에서 Google Cloud Vision API(TEXT_DETECTION)로
 * 글자를 추출한다. 무료 API 키 방식(REST)이라 별도 SDK/서비스 계정 없이 호출한다.
 */
export async function extractText(imageBuffer: Buffer): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) return "";

  try {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBuffer.toString("base64") },
              features: [{ type: "TEXT_DETECTION" }],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      console.error("Cloud Vision API error", res.status, await res.text());
      return "";
    }

    const json = await res.json();
    const text: string | undefined =
      json?.responses?.[0]?.fullTextAnnotation?.text;
    return text ?? "";
  } catch (err) {
    console.error("extractText error", err);
    return "";
  }
}
