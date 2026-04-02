import { useEffect, useRef, useState } from "react";

import { formatPlaybackTime } from "../lib/formatDuration.js";

/**
 * Theme-matched mini player (replaces native `<audio controls>`).
 */
export function VoiceAudioPlayer({ src, className = "" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !src) {
      return undefined;
    }

    const onLoaded = () => {
      setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    };
    const onTime = () => setCurrentTime(el.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    el.pause();
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    el.src = src;
    el.load();

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [src]);

  function toggle() {
    const el = audioRef.current;
    if (!el) {
      return;
    }
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    void el.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }

  function onSeek(event) {
    const el = audioRef.current;
    if (!el || !duration) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    el.currentTime = pct * duration;
    setCurrentTime(el.currentTime);
  }

  if (!src) {
    return null;
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
      <audio ref={audioRef} preload="metadata" src={src} className="hidden" />

      <button
        type="button"
        onClick={toggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-chat-accent/50"
        aria-label={playing ? "Pause voice memo" : "Play voice memo"}
      >
        {playing ? (
          <span className="flex gap-0.5" aria-hidden="true">
            <span className="h-3 w-0.5 rounded-sm bg-current" />
            <span className="h-3 w-0.5 rounded-sm bg-current" />
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div
          className="flex h-7 shrink-0 items-end gap-px opacity-80"
          aria-hidden="true"
        >
          {[0.35, 0.55, 0.85, 0.5, 0.7, 0.45, 0.9, 0.4].map((h, i) => (
            <span
              key={i}
              className="w-0.5 rounded-full bg-chat-accent/50"
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>

        <button
          type="button"
          className="group relative h-2.5 min-w-[6rem] flex-1 cursor-pointer rounded-full bg-white/10 text-left"
          onClick={onSeek}
          aria-label="Seek audio"
        >
          <span
            className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-chat-accent/90 transition-[width] duration-75 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </button>
      </div>

      <span className="shrink-0 tabular-nums text-[12px] text-chat-muted">
        {formatPlaybackTime(currentTime)} / {formatPlaybackTime(duration)}
      </span>
    </div>
  );
}
