import { ActionToolbar } from "@/components/toolbars/action-toolbar";
import { Group, Select, TextInput } from "@mantine/core";

type ReportFiltersToolbarProps = {
  severity: string;
  instanceUuid: string;
  onSeverityChange: (value: string) => void;
  onInstanceUuidChange: (value: string) => void;
  onInstanceUuidBlur: (value: string) => void;
};

export function ReportFiltersToolbar({
  severity,
  instanceUuid,
  onSeverityChange,
  onInstanceUuidChange,
  onInstanceUuidBlur
}: ReportFiltersToolbarProps) {
  return (
    <ActionToolbar>
      <Group align="end">
        <Select
          label="Severity"
          data={["", "low", "medium", "high", "critical"]}
          value={severity}
          onChange={(value) => onSeverityChange(value || "")}
        />
        <TextInput
          label="Instance UUID"
          placeholder="Filter instance UUID"
          value={instanceUuid}
          onChange={(e) => onInstanceUuidChange(e.currentTarget.value)}
          onBlur={(e) => onInstanceUuidBlur(e.currentTarget.value)}
        />
      </Group>
    </ActionToolbar>
  );
}
