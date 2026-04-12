"use client";

import { createProject, deleteProject, queryProjects } from "@/lib/api";
import type { ProjectOut } from "@/lib/orval/backend.schemas";
import { ActionToolbar } from "@/components/toolbars/action-toolbar";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { PageShell } from "@/components/layout/page-shell";
import { SectionCard } from "@/components/layout/section-card";
import { TablePaginationControls } from "@/components/tables/table-pagination-controls";
import { useSortState } from "@/lib/use-sort-state";
import { Button, Group, Table, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type SortField = "name" | "project_id" | "instances" | "day" | "week" | "total";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectOut[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const { sortField, sortDirection: sortDir, toggleSort, indicatorFor } = useSortState<SortField>("name", "asc");

  const load = useCallback(async (page: number, perPage: number, sortBy: SortField, nextSortDir: "asc" | "desc") => {
    try {
      const data = await queryProjects({
        page: page - 1,
        resultsperpage: perPage,
        include_stats: true,
        sort_by: sortBy,
        sort_dir: nextSortDir
      });
      const totalPages = Math.max(1, Math.ceil(data.total / perPage));
      if (page > totalPages) {
        setCurrentPage(totalPages);
        return;
      }
      const items = data.items;
      setProjects(items);
      setTotalProjects(data.total);
      setSelected((prev) => (items.some((p) => p.uuid === prev) ? prev : ""));
    } catch {
      notifications.show({ color: "red", title: "Projects", message: "Failed to load projects" });
    }
  }, []);

  useEffect(() => {
    void load(currentPage, resultsPerPage, sortField, sortDir);
  }, [currentPage, resultsPerPage, sortField, sortDir, load]);

  const selectedProject = useMemo(() => projects.find((p) => p.uuid === selected), [projects, selected]);

  function onSort(field: SortField) {
    toggleSort(field, () => setCurrentPage(1));
  }

  function sortIcon(field: SortField) {
    const indicator = indicatorFor(field);
    if (indicator === "asc") return <ExpandLessIcon fontSize="small" />;
    return <ExpandMoreIcon fontSize="small" />;
  }

  async function onCreate() {
    try {
      await createProject(projectId, name);
      notifications.show({ color: "green", title: "Project", message: "Project created" });
      setShowCreate(false);
      setProjectId("");
      setName("");
      setCurrentPage(1);
      await load(1, resultsPerPage, sortField, sortDir);
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
      await load(currentPage, resultsPerPage, sortField, sortDir);
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
              projects.map((p) => (
                <Table.Tr
                  key={p.uuid}
                  onClick={() => setSelected(p.uuid)}
                  style={{ cursor: "pointer", backgroundColor: selected === p.uuid ? "var(--mantine-color-teal-0)" : undefined }}
                >
                  <Table.Td>{p.name}</Table.Td>
                  <Table.Td>{p.project_id}</Table.Td>
                  <Table.Td>{p.stats?.instances ?? 0}</Table.Td>
                  <Table.Td>{p.stats?.day ?? 0}</Table.Td>
                  <Table.Td>{p.stats?.week ?? 0}</Table.Td>
                  <Table.Td>{p.stats?.total ?? 0}</Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        <TablePaginationControls
          currentPage={currentPage}
          total={totalProjects}
          resultsPerPage={resultsPerPage}
          onPageChange={(nextPage) => setCurrentPage(nextPage)}
          onResultsPerPageChange={(nextResultsPerPage) => {
            setResultsPerPage(nextResultsPerPage);
            setCurrentPage(1);
          }}
        />
      </SectionCard>

      <CreateProjectModal
        opened={showCreate}
        onClose={() => setShowCreate(false)}
        name={name}
        projectId={projectId}
        onNameChange={setName}
        onProjectIdChange={setProjectId}
        onSave={onCreate}
      />

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
