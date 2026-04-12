import { Paper } from "@mantine/core";

export function SectionCard({ children }: { children: React.ReactNode }) {
  return <Paper withBorder p="sm">{children}</Paper>;
}
