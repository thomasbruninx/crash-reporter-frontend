"use client";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { InstancesManagerModal } from "@/components/modals/instances-manager-modal";
import { PageShell } from "@/components/layout/page-shell";
import { ProjectHeader } from "@/components/headers/project-header";
import { ReportActionsToolbar } from "@/components/toolbars/report-actions-toolbar";
import { ReportFiltersToolbar } from "@/components/toolbars/report-filters-toolbar";
import { ReportViewModal } from "@/components/modals/report-view-modal";
import { ReportsTableSection } from "@/components/tables/reports-table-section";
import { formatTimestamp, reportRowBackground } from "@/lib/report-ui";
import { type InstanceSortField, type ReportSortField, useProjectDataState } from "@/lib/use-project-data-state";
import { useProjectMutations } from "@/lib/use-project-mutations";
import type { InstanceOut } from "@/lib/orval/backend.schemas";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
 

export default function ProjectPage() {
  const params = useParams<{ uuid: string }>();
  const router = useRouter();
  const uuid = params.uuid;
  const dataState = useProjectDataState(uuid);

  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [instancesOpen, setInstancesOpen] = useState(false);
  const [instanceDeleteOpen, setInstanceDeleteOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState<InstanceOut | null>(null);

  const mutations = useProjectMutations({
    uuid,
    name: dataState.name,
    selectedReport: dataState.selectedReport,
    setEditingName: dataState.setEditingName,
    setDeleteOpen,
    setSelected: dataState.setSelected,
    reloadCurrent: dataState.reloadCurrent
  });

  function reportSortIcon(field: ReportSortField) {
    const indicator = dataState.reportSortIndicatorFor(field);
    if (indicator === "asc") return <ExpandLessIcon fontSize="small" />;
    return <ExpandMoreIcon fontSize="small" />;
  }

  function instanceSortIcon(field: Exclude<InstanceSortField, "">) {
    const indicator = dataState.instanceSortIndicatorFor(field);
    if (indicator === "asc") return <ExpandLessIcon fontSize="small" />;
    return <ExpandMoreIcon fontSize="small" />;
  }

  return (
    <PageShell>
      <ProjectHeader
        name={dataState.name}
        editingName={dataState.editingName}
        onNameChange={dataState.setName}
        onStartEdit={() => dataState.setEditingName(true)}
        onSaveName={mutations.saveName}
        onBackToDashboard={() => router.push("/dashboard")}
      />

      <ReportFiltersToolbar
        severity={dataState.filterSeverity}
        instanceUuid={dataState.filterInstance}
        onSeverityChange={(value) => {
          dataState.setFilterSeverity(value);
          dataState.setReportPage(1);
        }}
        onInstanceUuidChange={(value) => {
          dataState.setFilterInstance(value);
          dataState.setReportPage(1);
        }}
        onInstanceUuidBlur={(value) => {
          dataState.setFilterInstance(value.trim());
          dataState.setReportPage(1);
        }}
      />

      <ReportActionsToolbar
        hasSelection={Boolean(dataState.selected)}
        onView={() => setViewOpen(true)}
        onExport={mutations.onExport}
        onDelete={() => setDeleteOpen(true)}
        onManageInstances={() => setInstancesOpen(true)}
      />

      <ReportsTableSection
        reports={dataState.reports}
        selectedReportUuid={dataState.selected}
        onSelectReport={dataState.setSelected}
        onSortByTimestamp={() => dataState.onSortReports("timestamp")}
        onSortBySeverity={() => dataState.onSortReports("severity")}
        onSortByInstanceUuid={() => dataState.onSortReports("instance_uuid")}
        timestampSortIcon={reportSortIcon("timestamp")}
        severitySortIcon={reportSortIcon("severity")}
        instanceUuidSortIcon={reportSortIcon("instance_uuid")}
        formatTimestamp={formatTimestamp}
        rowBackgroundForSeverity={reportRowBackground}
        currentPage={dataState.reportPage}
        total={dataState.reportTotal}
        resultsPerPage={dataState.reportResultsPerPage}
        onPageChange={(nextPage) => dataState.setReportPage(nextPage)}
        onResultsPerPageChange={(nextResultsPerPage) => {
          dataState.setReportResultsPerPage(nextResultsPerPage);
          dataState.setReportPage(1);
        }}
      />

      <ReportViewModal
        opened={viewOpen}
        onClose={() => setViewOpen(false)}
        selectedReport={dataState.selectedReport}
        formatTimestamp={formatTimestamp}
      />

      <ConfirmModal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete report?"
        onConfirm={mutations.onDeleteReport}
        confirmIcon={<DeleteOutlineIcon fontSize="small" />}
      />

      <InstancesManagerModal
        opened={instancesOpen}
        onClose={() => setInstancesOpen(false)}
        instances={dataState.instances}
        onSortByUuid={() => dataState.onSortInstances("uuid")}
        onSortByNotes={() => dataState.onSortInstances("notes")}
        sortIconForUuid={instanceSortIcon("uuid")}
        sortIconForNotes={instanceSortIcon("notes")}
        onSaveInstance={mutations.onUpdateInstanceNote}
        onRequestDeleteInstance={(instance) => {
          setInstanceToDelete(instance);
          setInstanceDeleteOpen(true);
        }}
        currentPage={dataState.instancePage}
        total={dataState.instanceTotal}
        resultsPerPage={dataState.instanceResultsPerPage}
        onPageChange={(nextPage) => dataState.setInstancePage(nextPage)}
        onResultsPerPageChange={(nextResultsPerPage) => {
          dataState.setInstanceResultsPerPage(nextResultsPerPage);
          dataState.setInstancePage(1);
        }}
      />

      <ConfirmModal
        opened={instanceDeleteOpen}
        onClose={() => setInstanceDeleteOpen(false)}
        title="Delete instance?"
        message="This will delete the instance and all related reports."
        onConfirm={async () => {
          if (!instanceToDelete) return;
          await mutations.onDeleteInstance(instanceToDelete);
          setInstanceDeleteOpen(false);
          setInstanceToDelete(null);
        }}
        confirmIcon={<DeleteOutlineIcon fontSize="small" />}
      />
    </PageShell>
  );
}
