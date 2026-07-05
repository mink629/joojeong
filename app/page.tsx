"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecords } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import type { DrinkRecord } from "@/lib/types";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      <span className="text-yellow-400">{"★".repeat(rating)}</span>
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function HomePage() {
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setRecords(getRecords());
  }, []);

  const filtered = query.trim()
    ? records.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.brand.toLowerCase().includes(query.toLowerCase())
      )
    : records;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold tracking-tight">내 술장</h1>
        <Link
          href="/new"
          onClick={() => trackEvent("새 기록 추가 클릭")}
          className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg leading-none hover:bg-gray-700 transition-colors"
          aria-label="새 기록 추가"
        >
          +
        </Link>
      </header>

      <div className="px-4 py-3 border-b border-gray-100">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름으로 검색"
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      </div>

      <main className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
            <span className="text-4xl">🍶</span>
            <p className="text-sm">
              {query ? "검색 결과가 없어요" : "첫 번째 술을 기록해보세요"}
            </p>
            {!query && (
              <Link href="/new" className="text-sm text-gray-900 underline underline-offset-2">
                새 기록 추가
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/records/${r.id}`}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {r.photoDataUrl ? (
                      <img src={r.photoDataUrl} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🍾</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {[r.brand, r.type].filter(Boolean).join(" · ")}
                    </p>
                    {r.rating > 0 && <StarDisplay rating={r.rating} />}
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
