import Link from "next/link";
import type { ReactNode } from "react";

export function TopBar({
  title,
  backHref,
  onBack,
  action,
}: {
  title: string;
  backHref?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-xl text-ink-muted"
        >
          ‹
        </button>
      ) : backHref ? (
        <Link
          href={backHref}
          aria-label="뒤로"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-xl text-ink-muted"
        >
          ‹
        </Link>
      ) : (
        <span className="w-8 flex-none" />
      )}
      <h1 className="flex-1 truncate text-[15px] font-bold">{title}</h1>
      {action ?? <span className="w-8 flex-none" />}
    </div>
  );
}
