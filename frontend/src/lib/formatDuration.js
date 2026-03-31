export function formatDuration(durationSeconds) {
  if (!durationSeconds) {
    return "0s";
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
