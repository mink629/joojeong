"use client";

import { useState } from "react";

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none focus:outline-none"
          aria-label={`${n}점`}
        >
          <span className={(hovered || value) >= n ? "text-yellow-400" : "text-gray-200"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-xl">
      <span className="text-yellow-400">{"★".repeat(rating)}</span>
      <span className="text-gray-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
