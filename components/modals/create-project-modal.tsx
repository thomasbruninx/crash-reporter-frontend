import { Button, Modal, Stack, TextInput } from "@mantine/core";
import SaveIcon from "@mui/icons-material/Save";

type CreateProjectModalProps = {
  opened: boolean;
  onClose: () => void;
  name: string;
  projectId: string;
  onNameChange: (value: string) => void;
  onProjectIdChange: (value: string) => void;
  onSave: () => void | Promise<void>;
};

export function CreateProjectModal({
  opened,
  onClose,
  name,
  projectId,
  onNameChange,
  onProjectIdChange,
  onSave
}: CreateProjectModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Create project" centered>
      <Stack>
        <TextInput label="Name" value={name} onChange={(e) => onNameChange(e.currentTarget.value)} />
        <TextInput label="Project ID" value={projectId} onChange={(e) => onProjectIdChange(e.currentTarget.value)} />
        <Button leftSection={<SaveIcon fontSize="small" />} aria-label="Save project" title="Save project" onClick={() => void onSave()}>
          Save
        </Button>
      </Stack>
    </Modal>
  );
}
