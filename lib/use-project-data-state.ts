import { queryInstances, queryProjects, queryReports } from "@/lib/api";
import type { InstanceOut, ReportOut } from "@/lib/orval/backend.schemas";
import { useSortState } from "@/lib/use-sort-state";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ReportSortField = "timestamp" | "severity" | "instance_uuid";
export type InstanceSortField = "" | "uuid" | "notes";

export function useProjectDataState(uuid: string) {
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);

  const [reports, setReports] = useState<ReportOut[]>([]);
  const [reportTotal, setReportTotal] = useState(0);
  const [reportPage, setReportPage] = useState(1);
  const [reportResultsPerPage, setReportResultsPerPage] = useState(25);
  const {
    sortField: reportSortBy,
    sortDirection: reportSortDir,
    toggleSort: toggleReportSort,
    indicatorFor: reportSortIndicatorFor
  } = useSortState<ReportSortField>("timestamp", "desc");

  const [instances, setInstances] = useState<InstanceOut[]>([]);
  const [instanceTotal, setInstanceTotal] = useState(0);
  const [instancePage, setInstancePage] = useState(1);
  const [instanceResultsPerPage, setInstanceResultsPerPage] = useState(25);
  const {
    sortField: instanceSortBy,
    sortDirection: instanceSortDir,
    toggleSort: toggleInstanceSort,
    indicatorFor: instanceSortIndicatorFor
  } = useSortState<InstanceSortField>("", "asc");

  const [selected, setSelected] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterInstance, setFilterInstance] = useState("");

  const normalizedInstanceFilter = filterInstance.trim();

  const loadData = useCallback(
    async (
      nextReportPage: number,
      nextReportResultsPerPage: number,
      nextInstancePage: number,
      nextInstanceResultsPerPage: number,
      nextReportSortBy: ReportSortField,
      nextReportSortDir: "asc" | "desc",
      nextInstanceSortBy: InstanceSortField,
      nextInstanceSortDir: "asc" | "desc"
    ) => {
      try {
        const projectResponse = await queryProjects({ uuids: [uuid], page: 0, resultsperpage: 1 });
        const project = projectResponse.items[0];
        setName(project?.name || "Project");

        const [reportResponse, instanceResponse] = await Promise.all([
          queryReports(uuid, filterSeverity || undefined, normalizedInstanceFilter || undefined, {
            page: nextReportPage - 1,
            resultsperpage: nextReportResultsPerPage,
            sort_by: nextReportSortBy,
            sort_dir: nextReportSortDir
          }),
          queryInstances({
            projectUuid: uuid,
            page: nextInstancePage - 1,
            resultsperpage: nextInstanceResultsPerPage,
            sort_by: nextInstanceSortBy || undefined,
            sort_dir: nextInstanceSortBy ? nextInstanceSortDir : undefined
          })
        ]);

        const reportTotalPages = Math.max(1, Math.ceil(reportResponse.total / nextReportResultsPerPage));
        const instanceTotalPages = Math.max(1, Math.ceil(instanceResponse.total / nextInstanceResultsPerPage));

        let shouldRefetch = false;
        if (nextReportPage > reportTotalPages) {
          setReportPage(reportTotalPages);
          shouldRefetch = true;
        }
        if (nextInstancePage > instanceTotalPages) {
          setInstancePage(instanceTotalPages);
          shouldRefetch = true;
        }
        if (shouldRefetch) return;

        setReports(reportResponse.items);
        setReportTotal(reportResponse.total);
        setSelected((prev) => (reportResponse.items.some((r) => r.uuid === prev) ? prev : ""));

        setInstances(instanceResponse.items);
        setInstanceTotal(instanceResponse.total);
      } catch {
        notifications.show({ color: "red", title: "Project", message: "Failed to load project data" });
      }
    },
    [uuid, filterSeverity, normalizedInstanceFilter]
  );

  useEffect(() => {
    void loadData(
      reportPage,
      reportResultsPerPage,
      instancePage,
      instanceResultsPerPage,
      reportSortBy,
      reportSortDir,
      instanceSortBy,
      instanceSortDir
    );
  }, [
    reportPage,
    reportResultsPerPage,
    instancePage,
    instanceResultsPerPage,
    reportSortBy,
    reportSortDir,
    instanceSortBy,
    instanceSortDir,
    loadData
  ]);

  const selectedReport = useMemo(() => reports.find((r) => r.uuid === selected), [reports, selected]);

  const onSortReports = useCallback(
    (field: ReportSortField) => {
      toggleReportSort(field, () => setReportPage(1));
    },
    [toggleReportSort]
  );

  const onSortInstances = useCallback(
    (field: Exclude<InstanceSortField, "">) => {
      toggleInstanceSort(field, () => setInstancePage(1));
    },
    [toggleInstanceSort]
  );

  const reloadCurrent = useCallback(async () => {
    await loadData(
      reportPage,
      reportResultsPerPage,
      instancePage,
      instanceResultsPerPage,
      reportSortBy,
      reportSortDir,
      instanceSortBy,
      instanceSortDir
    );
  }, [
    loadData,
    reportPage,
    reportResultsPerPage,
    instancePage,
    instanceResultsPerPage,
    reportSortBy,
    reportSortDir,
    instanceSortBy,
    instanceSortDir
  ]);

  return {
    name,
    setName,
    editingName,
    setEditingName,

    reports,
    reportTotal,
    reportPage,
    setReportPage,
    reportResultsPerPage,
    setReportResultsPerPage,
    selected,
    setSelected,
    selectedReport,

    filterSeverity,
    setFilterSeverity,
    filterInstance,
    setFilterInstance,

    reportSortIndicatorFor,
    onSortReports,

    instances,
    instanceTotal,
    instancePage,
    setInstancePage,
    instanceResultsPerPage,
    setInstanceResultsPerPage,
    instanceSortIndicatorFor,
    onSortInstances,

    reloadCurrent
  };
}
