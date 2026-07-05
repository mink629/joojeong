"use client";

export function TagSelect({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const toggle = (tag: string) =>
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag]
    );

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            selected.includes(tag)
              ? "bg-gray-900 text-white border-gray-900"
              : "text-gray-600 border-gray-200 hover:border-gray-400"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
