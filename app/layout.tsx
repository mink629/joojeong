import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "주정 (酒情)",
  description: "나만의 시음 기록장",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        <div className="max-w-md mx-auto min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
