import { Button, Modal, Stack, Text } from "@mantine/core";

export function ConfirmModal({
  opened,
  onClose,
  title,
  message,
  onConfirm,
  confirmLabel = "Confirm",
  confirmColor = "red",
  confirmIcon
}: {
  opened: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  confirmColor?: string;
  confirmIcon?: React.ReactNode;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack>
        {message ? <Text size="sm">{message}</Text> : null}
        <Button color={confirmColor} leftSection={confirmIcon} onClick={() => void onConfirm()}>
          {confirmLabel}
        </Button>
      </Stack>
    </Modal>
  );
}
