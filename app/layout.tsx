import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "주정 — 나만의 시음 노트",
  description:
    "라벨 사진 한 장으로 시음 기록을 남기고 내 맛/향 취향을 발견하는 앱",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-bg text-ink" suppressHydrationWarning>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface shadow-[0_0_0_1px_var(--border)] sm:my-4 sm:min-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
