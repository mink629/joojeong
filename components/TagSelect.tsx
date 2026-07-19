"use client";

export function TagSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(tag: string) {
    onChange(
      value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const active = value.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              active
                ? "border-ink bg-ink font-semibold text-bg"
                : "border-border text-ink-muted"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
