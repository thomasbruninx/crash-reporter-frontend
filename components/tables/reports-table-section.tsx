import { SectionCard } from "@/components/layout/section-card";
import { TablePaginationControls } from "@/components/tables/table-pagination-controls";
import type { ReportOut } from "@/lib/orval/backend.schemas";
import { Group, Table, Text } from "@mantine/core";

type ReportsTableSectionProps = {
  reports: ReportOut[];
  selectedReportUuid: string;
  onSelectReport: (uuid: string) => void;
  onSortByTimestamp: () => void;
  onSortBySeverity: () => void;
  onSortByInstanceUuid: () => void;
  timestampSortIcon: React.ReactNode;
  severitySortIcon: React.ReactNode;
  instanceUuidSortIcon: React.ReactNode;
  formatTimestamp: (ts: string) => string;
  rowBackgroundForSeverity: (severity: string) => string | undefined;
  currentPage: number;
  total: number;
  resultsPerPage: number;
  onPageChange: (nextPage: number) => void;
  onResultsPerPageChange: (nextResultsPerPage: number) => void;
};

export function ReportsTableSection({
  reports,
  selectedReportUuid,
  onSelectReport,
  onSortByTimestamp,
  onSortBySeverity,
  onSortByInstanceUuid,
  timestampSortIcon,
  severitySortIcon,
  instanceUuidSortIcon,
  formatTimestamp,
  rowBackgroundForSeverity,
  currentPage,
  total,
  resultsPerPage,
  onPageChange,
  onResultsPerPageChange
}: ReportsTableSectionProps) {
  return (
    <SectionCard>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th onClick={onSortByTimestamp} style={{ cursor: "pointer", userSelect: "none" }}>
              <Group gap={6} wrap="nowrap">
                <span>Timestamp (UTC)</span>
                {timestampSortIcon}
              </Group>
            </Table.Th>
            <Table.Th onClick={onSortBySeverity} style={{ cursor: "pointer", userSelect: "none" }}>
              <Group gap={6} wrap="nowrap">
                <span>Severity</span>
                {severitySortIcon}
              </Group>
            </Table.Th>
            <Table.Th onClick={onSortByInstanceUuid} style={{ cursor: "pointer", userSelect: "none" }}>
              <Group gap={6} wrap="nowrap">
                <span>Instance UUID</span>
                {instanceUuidSortIcon}
              </Group>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {reports.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c="dimmed" size="sm">
                  No reports found for this project.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            reports.map((report) => (
              <Table.Tr
                key={report.uuid}
                onClick={() => onSelectReport(report.uuid)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedReportUuid === report.uuid
                      ? "var(--mantine-color-teal-0)"
                      : rowBackgroundForSeverity(report.severity)
                }}
              >
                <Table.Td>{formatTimestamp(report.timestamp)}</Table.Td>
                <Table.Td>{report.severity}</Table.Td>
                <Table.Td>{report.instance_uuid}</Table.Td>
              </Table.Tr>
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
    </SectionCard>
  );
}
