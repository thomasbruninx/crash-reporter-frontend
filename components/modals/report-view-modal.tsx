import type { ReportOut } from "@/lib/orval/backend.schemas";
import { Modal, Stack, Table, Text } from "@mantine/core";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function isExpandable(v: unknown): v is Record<string, unknown> | unknown[] {
  return v !== null && typeof v === "object";
}

function typeLabel(v: Record<string, unknown> | unknown[]): string {
  if (Array.isArray(v)) return `[${v.length} item${v.length !== 1 ? "s" : ""}]`;
  const count = Object.keys(v).length;
  return `{${count} key${count !== 1 ? "s" : ""}}`;
}

/** Returns dot-notation paths of top-level expandable keys (depth 0 only). */
function getDefaultExpanded(metadata: Record<string, unknown>): Set<string> {
  const paths = new Set<string>();
  for (const [k, v] of Object.entries(metadata)) {
    if (isExpandable(v)) paths.add(k);
  }
  return paths;
}

// ─── recursive row renderer ───────────────────────────────────────────────────

type MetadataRowsProps = {
  data: Record<string, unknown> | unknown[];
  path: string;
  depth: number;
  expanded: Set<string>;
  toggle: (path: string) => void;
};

function MetadataRows({ data, path, depth, expanded, toggle }: MetadataRowsProps) {
  const entries: [string, unknown][] = Array.isArray(data)
    ? data.map((v, i) => [String(i), v])
    : Object.entries(data);

  return (
    <>
      {entries.map(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        const displayKey = Array.isArray(data) ? `[${key}]` : key;
        const isOpen = expanded.has(fullPath);

        if (isExpandable(value)) {
          return (
            <>
              <Table.Tr
                key={fullPath}
                onClick={() => toggle(fullPath)}
                style={{ cursor: "pointer" }}
              >
                <Table.Td style={{ paddingLeft: depth * 16 + 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    {displayKey}
                  </span>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {typeLabel(value)}
                  </Text>
                </Table.Td>
              </Table.Tr>
              {isOpen && (
                <MetadataRows
                  data={value}
                  path={fullPath}
                  depth={depth + 1}
                  expanded={expanded}
                  toggle={toggle}
                />
              )}
            </>
          );
        }

        return (
          <Table.Tr key={fullPath}>
            <Table.Td style={{ paddingLeft: depth * 16 + 8 + 18 }}>{displayKey}</Table.Td>
            <Table.Td>{String(value ?? "")}</Table.Td>
          </Table.Tr>
        );
      })}
    </>
  );
}

// ─── modal ────────────────────────────────────────────────────────────────────

type ReportViewModalProps = {
  opened: boolean;
  onClose: () => void;
  selectedReport?: ReportOut;
  formatTimestamp: (ts: string) => string;
};

export function ReportViewModal({ opened, onClose, selectedReport, formatTimestamp }: ReportViewModalProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    getDefaultExpanded(selectedReport?.metadata ?? {})
  );

  useEffect(() => {
    setExpanded(getDefaultExpanded(selectedReport?.metadata ?? {}));
  }, [selectedReport]);

  function toggle(path: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Report" size="xl" centered>
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
              <MetadataRows
                data={selectedReport.metadata}
                path=""
                depth={0}
                expanded={expanded}
                toggle={toggle}
              />
            </Table.Tbody>
          </Table>
        </Stack>
      ) : null}
    </Modal>
  );
}
