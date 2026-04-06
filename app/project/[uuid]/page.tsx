"use client";

import {
  deleteInstance,
  deleteReport,
  queryInstances,
  queryProjects,
  queryReports,
  updateInstance,
  updateProject
} from "@/lib/api";
import { ActionToolbar } from "@/components/mantineui/action-toolbar";
import { ConfirmModal } from "@/components/mantineui/confirm-modal";
import { PageShell } from "@/components/mantineui/page-shell";
import { SectionCard } from "@/components/mantineui/section-card";
import type { InstanceOut, ReportOut } from "@/lib/orval/backend.schemas";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconPencil } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function fmt(ts: string): string {
  const d = new Date(ts);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

function reportRowBackground(severity: string): string | undefined {
  if (severity === "critical" || severity === "high") return "var(--mantine-color-red-0)";
  if (severity === "medium") return "var(--mantine-color-yellow-0)";
  return undefined;
}

export default function ProjectPage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const uuid = params.uuid;
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [instances, setInstances] = useState<InstanceOut[]>([]);
  const [selected, setSelected] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("");
  const [filterInstance, setFilterInstance] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [instancesOpen, setInstancesOpen] = useState(false);
  const [instanceDeleteOpen, setInstanceDeleteOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<InstanceOut | null>(null);
  const lastLoadKeyRef = useRef<string>("");
  const normalizedInstanceFilter = filterInstance.trim();

  async function load() {
    try {
      const projects = await queryProjects();
      const project = projects.find((x) => x.uuid === uuid);
      setName(project?.name || "Project");
      const [rs, is] = await Promise.all([
        queryReports(uuid, filterSeverity || undefined, normalizedInstanceFilter || undefined),
        queryInstances({ projectUuid: uuid, projectId: project?.project_id })
      ]);
      setReports(rs);
      setInstances(is);
    } catch {
      notifications.show({ color: "red", title: "Project", message: "Failed to load project data" });
    }
  }

  useEffect(() => {
    const loadKey = `${uuid}|${filterSeverity}|${normalizedInstanceFilter}`;
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;
    void load();
  }, [uuid, filterSeverity, normalizedInstanceFilter]);

  const sortedReports = useMemo(() => {
    const copy = [...reports];
    copy.sort((a, b) =>
      sortAsc ? a.timestamp.localeCompare(b.timestamp) : b.timestamp.localeCompare(a.timestamp)
    );
    return copy;
  }, [reports, sortAsc]);

  const selectedReport = sortedReports.find((r) => r.uuid === selected);

  async function saveName() {
    try {
      await updateProject(uuid, name);
      notifications.show({ color: "green", title: "Project", message: "Project updated" });
      setEditingName(false);
    } catch {
      notifications.show({ color: "red", title: "Project", message: "Failed to update project" });
    }
  }

  async function onDeleteReport() {
    if (!selectedReport) return;
    try {
      await deleteReport(selectedReport.uuid);
      notifications.show({ color: "green", title: "Report", message: "Report deleted" });
      setDeleteOpen(false);
      setSelected("");
      await load();
    } catch {
      notifications.show({ color: "red", title: "Report", message: "Delete failed" });
    }
  }

  function onExport() {
    if (!selectedReport) return;
    const blob = new Blob([JSON.stringify(selectedReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${selectedReport.uuid}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onUpdateInstanceNote(inst: InstanceOut, notes: string) {
    try {
      await updateInstance(inst.uuid, notes);
      notifications.show({ color: "green", title: "Instance", message: "Instance updated" });
      await load();
    } catch {
      notifications.show({ color: "red", title: "Instance", message: "Instance update failed" });
    }
  }

  async function onDeleteInstance(inst: InstanceOut) {
    try {
      await deleteInstance(inst.uuid);
      notifications.show({ color: "green", title: "Instance", message: "Instance deleted" });
      await load();
    } catch {
      notifications.show({ color: "red", title: "Instance", message: "Instance delete failed" });
    }
  }

  return (
    <PageShell>
      <Group>
        {editingName ? (
          <>
            <TextInput value={name} onChange={(e) => setName(e.currentTarget.value)} />
            <Button aria-label="Save project name" title="Save project name" onClick={saveName}>
              <SaveIcon fontSize="small" />
            </Button>
          </>
        ) : (
          <>
            <Title order={2}>{name}</Title>
            <ActionIcon variant="default" onClick={() => setEditingName(true)}>
              <IconPencil size={16} />
            </ActionIcon>
          </>
        )}
        <Button variant="subtle" leftSection={<DashboardIcon fontSize="small" />} onClick={() => router.push("/dashboard")}>
          Return to dashboard
        </Button>
      </Group>

      <ActionToolbar>
        <Group align="end">
          <Select
            label="Severity"
            data={["", "low", "medium", "high", "critical"]}
            value={filterSeverity}
            onChange={(value) => setFilterSeverity(value || "")}
          />
          <TextInput
            label="Instance UUID"
            placeholder="Filter instance UUID"
            value={filterInstance}
            onChange={(e) => setFilterInstance(e.currentTarget.value)}
            onBlur={(e) => setFilterInstance(e.currentTarget.value.trim())}
          />
        </Group>
      </ActionToolbar>

      <ActionToolbar>
        <Button variant="default" leftSection={<VisibilityIcon fontSize="small" />} disabled={!selected} onClick={() => setViewOpen(true)}>
          View
        </Button>
        <Button variant="default" leftSection={<DownloadIcon fontSize="small" />} disabled={!selected} onClick={onExport}>
          Export
        </Button>
        <Button
          color="red"
          variant="light"
          leftSection={<DeleteOutlineIcon fontSize="small" />}
          disabled={!selected}
          onClick={() => setDeleteOpen(true)}
        >
          Delete
        </Button>
        <Button leftSection={<SettingsIcon fontSize="small" />} onClick={() => setInstancesOpen(true)}>
          Manage instances
        </Button>
      </ActionToolbar>

      <SectionCard>
        <Table withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th
                onClick={() => setSortAsc((s) => !s)}
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                <Group gap={6} wrap="nowrap">
                  <span>Timestamp</span>
                  {sortAsc ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </Group>
              </Table.Th>
              <Table.Th>Severity</Table.Th>
              <Table.Th>Instance UUID</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedReports.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed" size="sm">
                    No reports found for this project.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              sortedReports.map((r) => (
                <Table.Tr
                  key={r.uuid}
                  onClick={() => setSelected(r.uuid)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selected === r.uuid ? "var(--mantine-color-teal-0)" : reportRowBackground(r.severity)
                  }}
                >
                  <Table.Td>{fmt(r.timestamp)}</Table.Td>
                  <Table.Td>{r.severity}</Table.Td>
                  <Table.Td>{r.instance_uuid}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </SectionCard>

      <Modal opened={viewOpen} onClose={() => setViewOpen(false)} title="Report" size="lg" centered>
        {selectedReport && (
          <Stack>
            <Text>
              <b>Instance:</b> {selectedReport.instance_uuid}
            </Text>
            <Text>
              <b>Date:</b> {fmt(selectedReport.timestamp)}
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
        )}
      </Modal>

      <ConfirmModal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete report?"
        onConfirm={onDeleteReport}
        confirmIcon={<DeleteOutlineIcon fontSize="small" />}
      />

      <Modal opened={instancesOpen} onClose={() => setInstancesOpen(false)} title="Manage instances" size="lg" centered>
        <Table withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>UUID</Table.Th>
              <Table.Th>Notes</Table.Th>
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
                  onSave={onUpdateInstanceNote}
                  onDelete={(instance) => {
                    setInstanceToDelete(instance);
                    setInstanceDeleteOpen(true);
                  }}
                />
              ))
            )}
          </Table.Tbody>
        </Table>
      </Modal>

      <ConfirmModal
        opened={instanceDeleteOpen}
        onClose={() => setInstanceDeleteOpen(false)}
        title="Delete instance?"
        message="This will delete the instance and all related reports."
        onConfirm={async () => {
          if (!instanceToDelete) return;
          await onDeleteInstance(instanceToDelete);
          setInstanceDeleteOpen(false);
          setInstanceToDelete(null);
        }}
        confirmIcon={<DeleteOutlineIcon fontSize="small" />}
      />
    </PageShell>
  );
}

function InstanceRow({
  instance,
  onSave,
  onDelete
}: {
  instance: InstanceOut;
  onSave: (instance: InstanceOut, notes: string) => Promise<void>;
  onDelete: (instance: InstanceOut) => void;
}) {
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
          <Button
            variant="default"
            size="xs"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? <CloseIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </Button>
          <Button
            size="xs"
            color="red"
            variant="light"
            onClick={() => onDelete(instance)}
          >
            <DeleteOutlineIcon fontSize="small" />
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
