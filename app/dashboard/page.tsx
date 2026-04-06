"use client";

import { createProject, deleteProject, queryInstances, queryProjects, queryReports } from "@/lib/api";
import type { ProjectOut } from "@/lib/orval/backend.schemas";
import { ActionToolbar } from "@/components/mantineui/action-toolbar";
import { ConfirmModal } from "@/components/mantineui/confirm-modal";
import { PageShell } from "@/components/mantineui/page-shell";
import { SectionCard } from "@/components/mantineui/section-card";
import {
  Button,
  Group,
  Modal,
  Stack,
  Table,
  TextInput,
  Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type ProjectStats = { instances: number; day: number; week: number; total: number };
type SortField = "name" | "project_id" | "instances" | "day" | "week" | "total";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [stats, setStats] = useState<Record<string, ProjectStats>>({});
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const didInitialLoadRef = useRef(false);

  async function load() {
    try {
      const items = await queryProjects();
      setProjects(items);
      const nextStats: Record<string, ProjectStats> = {};
      const settledStats = await Promise.allSettled(
        items.map(async (p) => {
          const [instances, reports] = await Promise.all([
            queryInstances({ projectUuid: p.uuid, projectId: p.project_id }),
            queryReports(p.uuid)
          ]);
          const now = Date.now();
          return {
            uuid: p.uuid,
            stats: {
              instances: instances.length,
              day: reports.filter((r) => now - new Date(r.timestamp).getTime() <= 24 * 3600 * 1000).length,
              week: reports.filter((r) => now - new Date(r.timestamp).getTime() <= 7 * 24 * 3600 * 1000).length,
              total: reports.length
            }
          };
        })
      );

      for (const p of items) {
        nextStats[p.uuid] = { instances: 0, day: 0, week: 0, total: 0 };
      }

      for (const result of settledStats) {
        if (result.status === "fulfilled") {
          nextStats[result.value.uuid] = result.value.stats;
        }
      }
      const hasStatsFailures = settledStats.some((result) => result.status === "rejected");
      if (hasStatsFailures) {
        notifications.show({
          color: "yellow",
          title: "Projects",
          message: "Some project counters could not be loaded; showing available data."
        });
      }
      setStats(nextStats);
    } catch {
      notifications.show({ color: "red", title: "Projects", message: "Failed to load projects" });
    }
  }

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    void load();
  }, []);

  const selectedProject = useMemo(() => projects.find((p) => p.uuid === selected), [projects, selected]);
  const sortedProjects = useMemo(() => {
    const items = [...projects];
    items.sort((a, b) => {
      const aStats = stats[a.uuid] ?? { instances: 0, day: 0, week: 0, total: 0 };
      const bStats = stats[b.uuid] ?? { instances: 0, day: 0, week: 0, total: 0 };
      let result = 0;
      switch (sortField) {
        case "name":
          result = a.name.localeCompare(b.name);
          break;
        case "project_id":
          result = a.project_id.localeCompare(b.project_id);
          break;
        case "instances":
          result = aStats.instances - bStats.instances;
          break;
        case "day":
          result = aStats.day - bStats.day;
          break;
        case "week":
          result = aStats.week - bStats.week;
          break;
        case "total":
          result = aStats.total - bStats.total;
          break;
      }
      return sortAsc ? result : -result;
    });
    return items;
  }, [projects, stats, sortField, sortAsc]);

  function onSort(field: SortField) {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
      return;
    }
    setSortField(field);
    setSortAsc(true);
  }

  function sortIcon(field: SortField) {
    if (sortField !== field) return <ExpandMoreIcon fontSize="small" />;
    return sortAsc ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />;
  }

  async function onCreate() {
    try {
      await createProject(projectId, name);
      notifications.show({ color: "green", title: "Project", message: "Project created" });
      setShowCreate(false);
      setProjectId("");
      setName("");
      await load();
    } catch {
      notifications.show({ color: "red", title: "Project", message: "Create failed" });
    }
  }

  async function onDelete() {
    if (!selectedProject) return;
    try {
      await deleteProject(selectedProject.uuid);
      notifications.show({ color: "green", title: "Project", message: "Project deleted" });
      setShowDelete(false);
      setSelected("");
      await load();
    } catch {
      notifications.show({ color: "red", title: "Project", message: "Delete failed" });
    }
  }

  return (
    <PageShell title="Projects">
      <ActionToolbar>
        <Button leftSection={<AddCircleOutlineIcon fontSize="small" />} onClick={() => setShowCreate(true)}>
          Add
        </Button>
        <Button
          variant="default"
          leftSection={<SettingsIcon fontSize="small" />}
          disabled={!selected}
          onClick={() => router.push(`/project/${selected}`)}
        >
          Manage
        </Button>
        <Button
          color="red"
          variant="light"
          leftSection={<DeleteOutlineIcon fontSize="small" />}
          disabled={!selected}
          onClick={() => setShowDelete(true)}
        >
          Delete
        </Button>
      </ActionToolbar>

      <SectionCard>
        <Table highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th onClick={() => onSort("name")} style={{ cursor: "pointer", userSelect: "none" }}>
                <Group gap={6} wrap="nowrap">
                  <span>Name</span>
                  {sortIcon("name")}
                </Group>
              </Table.Th>
              <Table.Th onClick={() => onSort("project_id")} style={{ cursor: "pointer", userSelect: "none" }}>
                <Group gap={6} wrap="nowrap">
                  <span>Project ID</span>
                  {sortIcon("project_id")}
                </Group>
              </Table.Th>
              <Table.Th onClick={() => onSort("instances")} style={{ cursor: "pointer", userSelect: "none" }}>
                <Group gap={6} wrap="nowrap">
                  <span>Instances</span>
                  {sortIcon("instances")}
                </Group>
              </Table.Th>
              <Table.Th onClick={() => onSort("day")} style={{ cursor: "pointer", userSelect: "none" }}>
                <Group gap={6} wrap="nowrap">
                  <span>Reports 24h</span>
                  {sortIcon("day")}
                </Group>
              </Table.Th>
              <Table.Th onClick={() => onSort("week")} style={{ cursor: "pointer", userSelect: "none" }}>
                <Group gap={6} wrap="nowrap">
                  <span>Reports 7d</span>
                  {sortIcon("week")}
                </Group>
              </Table.Th>
              <Table.Th onClick={() => onSort("total")} style={{ cursor: "pointer", userSelect: "none" }}>
                <Group gap={6} wrap="nowrap">
                  <span>Reports total</span>
                  {sortIcon("total")}
                </Group>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {projects.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" size="sm">
                    No projects found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              sortedProjects.map((p) => (
                <Table.Tr
                  key={p.uuid}
                  onClick={() => setSelected(p.uuid)}
                  style={{ cursor: "pointer", backgroundColor: selected === p.uuid ? "var(--mantine-color-teal-0)" : undefined }}
                >
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td>{p.project_id}</Table.Td>
                  <Table.Td>{stats[p.uuid]?.instances ?? 0}</Table.Td>
                  <Table.Td>{stats[p.uuid]?.day ?? 0}</Table.Td>
                  <Table.Td>{stats[p.uuid]?.week ?? 0}</Table.Td>
                  <Table.Td>{stats[p.uuid]?.total ?? 0}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </SectionCard>

      <Modal opened={showCreate} onClose={() => setShowCreate(false)} title="Create project" centered>
        <Stack>
          <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <TextInput label="Project ID" value={projectId} onChange={(e) => setProjectId(e.currentTarget.value)} />
          <Button leftSection={<SaveIcon fontSize="small" />} aria-label="Save project" title="Save project" onClick={onCreate}>
            Save
          </Button>
        </Stack>
      </Modal>

      <ConfirmModal
        opened={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete project?"
        message="This action cannot be undone."
        onConfirm={onDelete}
        confirmIcon={<DeleteOutlineIcon fontSize="small" />}
      />
    </PageShell>
  );
}
