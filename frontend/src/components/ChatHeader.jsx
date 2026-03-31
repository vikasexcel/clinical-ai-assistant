export function ChatHeader({ onNewChat, disableNewChat }) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-chat-border bg-chat-bg">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <h1 className="truncate text-[15px] font-semibold text-white">Clinical Assistant</h1>
        <button
          className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] text-chat-muted transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={disableNewChat}
          onClick={onNewChat}
          type="button"
        >
          New chat
        </button>
      </div>
    </header>
  );
}
