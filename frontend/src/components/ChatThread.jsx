import { useEffect, useRef } from "react";

import { ChatMessage } from "./ChatMessage.jsx";

function EmptyState() {
  return (
    <div className="flex min-h-[min(50svh,20rem)] flex-col items-center justify-center px-4 pb-8 pt-6 text-center">
      <p className="text-[22px] font-medium text-white sm:text-2xl">How can I help today?</p>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-chat-muted">
        Describe an encounter or paste rough notes. Optional image or short voice memo.
      </p>
    </div>
  );
}

export function ChatThread({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const showEmpty = messages.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-3 pb-6 pt-2 sm:px-4">
      {showEmpty ? <EmptyState /> : null}

      <ul className="flex list-none flex-col gap-8 p-0" aria-label="Conversation">
        {messages.map((message) => (
          <li key={message.id} className="min-w-0">
            <ChatMessage message={message} />
          </li>
        ))}
      </ul>
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
    </div>
  );
}
