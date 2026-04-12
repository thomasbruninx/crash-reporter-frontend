export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

export function reportRowBackground(severity: string): string | undefined {
  if (severity === "critical" || severity === "high") return "var(--mantine-color-red-0)";
  if (severity === "medium") return "var(--mantine-color-yellow-0)";
  return undefined;
}
