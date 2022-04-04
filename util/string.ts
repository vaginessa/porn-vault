import format from "format-duration";

export function formatDuration(secs: number): string {
  return format(secs * 1000);
}
