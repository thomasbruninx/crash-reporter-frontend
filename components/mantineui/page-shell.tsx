import { Container, Stack, Title } from "@mantine/core";

export function PageShell({
  title,
  children,
  size = "xl"
}: {
  title?: string;
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <Container size={size} py="xl">
      <Stack gap="md">
        {title ? <Title order={2}>{title}</Title> : null}
        {children}
      </Stack>
    </Container>
  );
}
