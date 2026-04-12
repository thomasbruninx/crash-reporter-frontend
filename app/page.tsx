"use client";

import { login } from "@/lib/api";
import { PageShell } from "@/components/layout/page-shell";
import {
  Button,
  Card,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import LoginIcon from "@mui/icons-material/Login";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(username, password);
      notifications.show({ color: "green", title: "Login", message: "Logged in successfully" });
      router.push("/dashboard");
    } catch {
      notifications.show({ color: "red", title: "Login", message: "Login failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell size="xs">
      <Card withBorder shadow="sm" p="xl" component="form" onSubmit={onSubmit}>
        <Stack gap="md">
          <Title order={2}>Crash Reporter Login</Title>
          <Text c="dimmed" size="sm">
            Sign in with your backend credentials.
          </Text>
          <TextInput label="Username" value={username} onChange={(e) => setUsername(e.currentTarget.value)} required />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
          <Button loading={busy} leftSection={<LoginIcon fontSize="small" />} type="submit">
            Sign In
          </Button>
        </Stack>
      </Card>
    </PageShell>
  );
}
