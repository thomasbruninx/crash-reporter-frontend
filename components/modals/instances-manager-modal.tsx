import { TablePaginationControls } from "@/components/tables/table-pagination-controls";
import type { InstanceOut } from "@/lib/orval/backend.schemas";
import { Group, Modal, Table, Text } from "@mantine/core";
import { InstanceRow } from "@/components/tables/instance-row";

type InstancesManagerModalProps = {
  opened: boolean;
  onClose: () => void;
  instances: InstanceOut[];
  onSortByUuid: () => void;
  onSortByNotes: () => void;
  sortIconForUuid: React.ReactNode;
  sortIconForNotes: React.ReactNode;
  onSaveInstance: (instance: InstanceOut, notes: string) => Promise<void>;
  onRequestDeleteInstance: (instance: InstanceOut) => void;
  currentPage: number;
  total: number;
  resultsPerPage: number;
  onPageChange: (nextPage: number) => void;
  onResultsPerPageChange: (nextResultsPerPage: number) => void;
};

export function InstancesManagerModal({
  opened,
  onClose,
  instances,
  onSortByUuid,
  onSortByNotes,
  sortIconForUuid,
  sortIconForNotes,
  onSaveInstance,
  onRequestDeleteInstance,
  currentPage,
  total,
  resultsPerPage,
  onPageChange,
  onResultsPerPageChange
}: InstancesManagerModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Manage instances" size="lg" centered>
      <Table withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th onClick={onSortByUuid} style={{ cursor: "pointer", userSelect: "none" }}>
              <Group gap={6} wrap="nowrap">
                <span>UUID</span>
                {sortIconForUuid}
              </Group>
            </Table.Th>
            <Table.Th onClick={onSortByNotes} style={{ cursor: "pointer", userSelect: "none" }}>
              <Group gap={6} wrap="nowrap">
                <span>Notes</span>
                {sortIconForNotes}
              </Group>
            </Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {instances.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c="dimmed" size="sm">
                  No instances found for this project.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            instances.map((inst) => (
              <InstanceRow
                key={inst.uuid}
                instance={inst}
                onSave={onSaveInstance}
                onDelete={onRequestDeleteInstance}
              />
            ))
          )}
        </Table.Tbody>
      </Table>
      <TablePaginationControls
        currentPage={currentPage}
        total={total}
        resultsPerPage={resultsPerPage}
        onPageChange={onPageChange}
        onResultsPerPageChange={onResultsPerPageChange}
      />
    </Modal>
  );
}
