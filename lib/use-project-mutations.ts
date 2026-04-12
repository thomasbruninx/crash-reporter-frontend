import { deleteInstance, deleteReport, updateInstance, updateProject } from "@/lib/api";
import type { InstanceOut, ReportOut } from "@/lib/orval/backend.schemas";
import { notifications } from "@mantine/notifications";
import { useCallback } from "react";

type UseProjectMutationsParams = {
  uuid: string;
  name: string;
  selectedReport?: ReportOut;
  setEditingName: (editingName: boolean) => void;
  setDeleteOpen: (open: boolean) => void;
  setSelected: (selected: string) => void;
  reloadCurrent: () => Promise<void>;
};

export function useProjectMutations({
  uuid,
  name,
  selectedReport,
  setEditingName,
  setDeleteOpen,
  setSelected,
  reloadCurrent
}: UseProjectMutationsParams) {
  const saveName = useCallback(async () => {
    try {
      await updateProject(uuid, name);
      notifications.show({ color: "green", title: "Project", message: "Project updated" });
      setEditingName(false);
    } catch {
      notifications.show({ color: "red", title: "Project", message: "Failed to update project" });
    }
  }, [uuid, name, setEditingName]);

  const onDeleteReport = useCallback(async () => {
    if (!selectedReport) return;
    try {
      await deleteReport(selectedReport.uuid);
      notifications.show({ color: "green", title: "Report", message: "Report deleted" });
      setDeleteOpen(false);
      setSelected("");
      await reloadCurrent();
    } catch {
      notifications.show({ color: "red", title: "Report", message: "Delete failed" });
    }
  }, [selectedReport, setDeleteOpen, setSelected, reloadCurrent]);

  const onExport = useCallback(() => {
    if (!selectedReport) return;
    const blob = new Blob([JSON.stringify(selectedReport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${selectedReport.uuid}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedReport]);

  const onUpdateInstanceNote = useCallback(
    async (inst: InstanceOut, notes: string) => {
      try {
        await updateInstance(inst.uuid, notes);
        notifications.show({ color: "green", title: "Instance", message: "Instance updated" });
        await reloadCurrent();
      } catch {
        notifications.show({ color: "red", title: "Instance", message: "Instance update failed" });
      }
    },
    [reloadCurrent]
  );

  const onDeleteInstance = useCallback(
    async (inst: InstanceOut) => {
      try {
        await deleteInstance(inst.uuid);
        notifications.show({ color: "green", title: "Instance", message: "Instance deleted" });
        await reloadCurrent();
      } catch {
        notifications.show({ color: "red", title: "Instance", message: "Instance delete failed" });
      }
    },
    [reloadCurrent]
  );

  return {
    saveName,
    onDeleteReport,
    onExport,
    onUpdateInstanceNote,
    onDeleteInstance
  };
}
