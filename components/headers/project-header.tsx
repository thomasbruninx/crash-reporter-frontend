import { ActionIcon, Button, Group, TextInput, Title } from "@mantine/core";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SaveIcon from "@mui/icons-material/Save";
import { IconPencil } from "@tabler/icons-react";

type ProjectHeaderProps = {
  name: string;
  editingName: boolean;
  onNameChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveName: () => void;
  onBackToDashboard: () => void;
};

export function ProjectHeader({
  name,
  editingName,
  onNameChange,
  onStartEdit,
  onSaveName,
  onBackToDashboard
}: ProjectHeaderProps) {
  return (
    <Group>
      {editingName ? (
        <>
          <TextInput value={name} onChange={(e) => onNameChange(e.currentTarget.value)} />
          <Button aria-label="Save project name" title="Save project name" onClick={onSaveName}>
            <SaveIcon fontSize="small" />
          </Button>
        </>
      ) : (
        <>
          <Title order={2}>{name}</Title>
          <ActionIcon variant="default" onClick={onStartEdit}>
            <IconPencil size={16} />
          </ActionIcon>
        </>
      )}
      <Button variant="subtle" leftSection={<DashboardIcon fontSize="small" />} onClick={onBackToDashboard}>
        Return to dashboard
      </Button>
    </Group>
  );
}
