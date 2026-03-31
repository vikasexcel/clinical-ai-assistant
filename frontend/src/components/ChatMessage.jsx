import { StructuredResult } from "./StructuredResult.jsx";

function UserBubble({ text, imageFileName, hasAudio, audioDurationLabel }) {
  const hasText = text.trim().length > 0;
  const meta = [
    hasAudio ? `Voice ${audioDurationLabel}` : null,
    imageFileName ? imageFileName : null,
  ].filter(Boolean);

  return (
    <article className="flex justify-end" aria-label="Your message">
      <div className="max-w-[min(100%,28rem)] rounded-3xl bg-chat-elevated px-4 py-2.5 text-[15px] leading-relaxed text-white">
        {meta.length > 0 ? (
          <p className="mb-1.5 text-[12px] text-chat-muted">{meta.join(" · ")}</p>
        ) : null}
        {hasText ? (
          <p className="whitespace-pre-wrap">{text.trim()}</p>
        ) : (
          <p className="text-chat-muted italic">Attachments only</p>
        )}
      </div>
    </article>
  );
}

function AssistantLoading() {
  return (
    <div className="flex items-center gap-2 text-chat-muted" aria-busy="true" aria-live="polite">
      <span className="flex gap-1" aria-hidden="true">
        <span className="h-2 w-2 animate-bounce rounded-full bg-chat-muted [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-chat-muted [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-chat-muted [animation-delay:300ms]" />
      </span>
      <span className="text-[15px]">Thinking…</span>
    </div>
  );
}

function AssistantError({ message }) {
  return (
    <div className="max-w-[min(100%,36rem)] rounded-xl border border-red-500/30 bg-red-950/35 px-4 py-3 text-[15px] text-red-100" role="alert">
      {message}
    </div>
  );
}

export function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <UserBubble
        audioDurationLabel={message.audioDurationLabel}
        hasAudio={message.hasAudio}
        imageFileName={message.imageFileName}
        text={message.text}
      />
    );
  }

  if (message.role === "assistant") {
    if (message.pending) {
      return <AssistantLoading />;
    }
    if (message.error) {
      return <AssistantError message={message.error} />;
    }
    if (message.result) {
      return (
        <div className="min-w-0 w-full">
          <StructuredResult result={message.result} />
        </div>
      );
    }
  }

  return null;
}
