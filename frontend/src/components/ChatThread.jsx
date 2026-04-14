import { useEffect, useRef } from "react";

import { ChatMessage } from "./ChatMessage.jsx";

/**
 * Pair flat [user, assistant, ...] messages into { user, assistant } for chart-style sections.
 */
function pairMessages(messages) {
  const pairs = [];
  for (let i = 0; i < messages.length; i += 2) {
    const user = messages[i];
    const assistant = messages[i + 1];
    if (user?.role === "user" && assistant?.role === "assistant") {
      pairs.push({ user, assistant });
    }
  }
  return pairs;
}

export function ChatThread({ messages }) {
  const bottomRef = useRef(null);
  const pairs = pairMessages(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (pairs.length === 0) {
    return null;
  }

  return (
    <div className="pb-6">
      <div className="border-b border-[#e5e7eb] pb-3">
        <h2 className="text-[1.0625rem] font-semibold tracking-tight text-gray-900">Results</h2>
        <p className="mt-0.5 text-[12px] text-[#6b7280]">Review before saving to the chart</p>
      </div>

      <div className="space-y-3 pt-4 sm:space-y-4">
        {pairs.map(({ user, assistant }, index) => (
          <section
            key={user.id}
            className="rounded-lg border border-[#d1d5db] bg-white p-3 sm:p-4"
            aria-labelledby={pairs.length > 1 ? `result-${user.id}-title` : undefined}
          >
            {pairs.length > 1 ? (
              <div className="mb-3 border-b border-[#e5e7eb] pb-2">
                <h3 id={`result-${user.id}-title`} className="text-[14px] font-semibold text-gray-900">
                  Run {index + 1}
                </h3>
              </div>
            ) : null}
            <ChatMessage hideLabels message={assistant} />
          </section>
        ))}
      </div>
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden="true" />
    </div>
  );
}
