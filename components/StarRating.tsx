"use client";

export function StarRating({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-xs" : "text-base";

  if (!onChange) {
    return (
      <div className={`flex gap-1 ${sizeClass}`} aria-label={`별점 ${value}점`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={value >= n ? "text-accent" : "text-border"}>
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex gap-1 ${sizeClass}`}
      role="radiogroup"
      aria-label="별점"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n}점`}
          aria-pressed={value >= n}
          className={value >= n ? "text-accent" : "text-border"}
        >
          ★
        </button>
      ))}
    </div>
  );
}
