import { Group } from "@mantine/core";

export function ActionToolbar({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <Group justify={align === "right" ? "flex-end" : "flex-start"}>{children}</Group>;
}
