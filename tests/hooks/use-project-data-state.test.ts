// @vitest-environment jsdom

import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  queryProjects: vi.fn(),
  queryReports: vi.fn(),
  queryInstances: vi.fn()
}));

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn()
  }
}));

import { queryInstances, queryProjects, queryReports } from "@/lib/api";
import { useProjectDataState } from "@/lib/use-project-data-state";

const mockQueryProjects = vi.mocked(queryProjects);
const mockQueryReports = vi.mocked(queryReports);
const mockQueryInstances = vi.mocked(queryInstances);

describe("useProjectDataState", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockQueryProjects.mockResolvedValue({
      items: [{ name: "Project A" }],
      total: 1
    } as any);

    mockQueryReports.mockResolvedValue({
      items: [
        {
          uuid: "r1",
          timestamp: "2026-04-12T10:00:00Z",
          severity: "high",
          instance_uuid: "i1",
          metadata: { key: "value" }
        }
      ],
      total: 1
    } as any);

    mockQueryInstances.mockResolvedValue({
      items: [{ uuid: "i1", notes: "note 1" }],
      total: 1
    } as any);
  });

  it("loads initial project, report, and instance data", async () => {
    const { result } = renderHook(() => useProjectDataState("project-1"));

    await waitFor(() => {
      expect(result.current.name).toBe("Project A");
      expect(result.current.reports).toHaveLength(1);
      expect(result.current.instances).toHaveLength(1);
    });

    expect(mockQueryProjects).toHaveBeenCalledWith({ uuids: "project-1", page: 0, resultsperpage: 1 });
  });

  it("resets report page to 1 when changing report sort field", async () => {
    const { result } = renderHook(() => useProjectDataState("project-1"));

    await waitFor(() => {
      expect(result.current.reports).toHaveLength(1);
    });

    act(() => {
      result.current.setReportPage(3);
    });

    expect(result.current.reportPage).toBe(3);

    act(() => {
      result.current.onSortReports("severity");
    });

    await waitFor(() => {
      expect(result.current.reportPage).toBe(1);
    });

    await waitFor(() => {
      expect(mockQueryReports).toHaveBeenCalled();
    });
  });

  it("passes trimmed instance filter and severity filter to report query", async () => {
    const { result } = renderHook(() => useProjectDataState("project-1"));

    await waitFor(() => {
      expect(mockQueryReports).toHaveBeenCalled();
    });

    act(() => {
      result.current.setFilterSeverity("critical");
      result.current.setFilterInstance("  instance-xyz  ");
    });

    await waitFor(() => {
      expect(mockQueryReports).toHaveBeenLastCalledWith(
        "project-1",
        "critical",
        "instance-xyz",
        expect.any(Object)
      );
    });
  });
});
