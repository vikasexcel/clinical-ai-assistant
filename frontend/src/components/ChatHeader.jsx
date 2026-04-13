export function ChatHeader({ onNewChat, disableNewChat }) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-clinical-border-soft bg-clinical-surface/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
      <div className="flex w-full items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-clinical-border-soft bg-clinical-elevated shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            aria-hidden="true"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-clinical-accent">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" />
              <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[1.02rem] font-semibold tracking-tight text-clinical-ink sm:text-[1.05rem] sm:text-lg">
              MedClaim AI
            </p>
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-clinical-muted sm:text-[11px] sm:tracking-[0.14em]">
              Documentation workspace
            </p>
          </div>
        </div>
        <button
          className="shrink-0 rounded-lg border border-transparent px-2.5 py-2 text-[12px] font-medium text-clinical-muted transition hover:border-clinical-border-soft hover:bg-clinical-elevated hover:text-clinical-ink disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-[13px]"
          aria-label="Clear workspace"
          disabled={disableNewChat}
          onClick={onNewChat}
          type="button"
        >
          <span className="sm:hidden">Clear</span>
          <span className="hidden sm:inline">Clear workspace</span>
        </button>
      </div>
    </header>
  );
}
