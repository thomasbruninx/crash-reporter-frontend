import type { InstanceOut } from "@/lib/orval/backend.schemas";
import { Button, Group, Table, Text, TextInput } from "@mantine/core";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";

type InstanceRowProps = {
  instance: InstanceOut;
  onSave: (instance: InstanceOut, notes: string) => Promise<void>;
  onDelete: (instance: InstanceOut) => void;
};

export function InstanceRow({ instance, onSave, onDelete }: InstanceRowProps) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(instance.notes);

  return (
    <Table.Tr>
      <Table.Td>{instance.uuid}</Table.Td>
      <Table.Td>
        {editing ? (
          <TextInput
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await onSave(instance, notes);
                setEditing(false);
              }
            }}
          />
        ) : (
          <Text>{notes}</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group>
          <Button variant="default" size="xs" onClick={() => setEditing((v) => !v)}>
            {editing ? <CloseIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </Button>
          <Button size="xs" color="red" variant="light" onClick={() => onDelete(instance)}>
            <DeleteOutlineIcon fontSize="small" />
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
