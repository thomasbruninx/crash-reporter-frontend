import type { ReportOut } from "@/lib/orval/backend.schemas";
import { Modal, Stack, Table, Text } from "@mantine/core";

type ReportViewModalProps = {
  opened: boolean;
  onClose: () => void;
  selectedReport?: ReportOut;
  formatTimestamp: (ts: string) => string;
};

export function ReportViewModal({ opened, onClose, selectedReport, formatTimestamp }: ReportViewModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Report" size="lg" centered>
      {selectedReport ? (
        <Stack>
          <Text>
            <b>Instance:</b> {selectedReport.instance_uuid}
          </Text>
          <Text>
            <b>Date:</b> {formatTimestamp(selectedReport.timestamp)}
          </Text>
          <Text>
            <b>Severity:</b> {selectedReport.severity}
          </Text>
          <Table withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Key</Table.Th>
                <Table.Th>Value</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(selectedReport.metadata).map(([k, v]) => (
                <Table.Tr key={k}>
                  <Table.Td>{k}</Table.Td>
                  <Table.Td>{JSON.stringify(v)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      ) : null}
    </Modal>
  );
}
