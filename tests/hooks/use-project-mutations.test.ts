// @vitest-environment jsdom

import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  updateProject: vi.fn(),
  deleteReport: vi.fn(),
  updateInstance: vi.fn(),
  deleteInstance: vi.fn()
}));

vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn()
  }
}));

import { deleteInstance, deleteReport, updateInstance, updateProject } from "@/lib/api";
import { useProjectMutations } from "@/lib/use-project-mutations";

const mockUpdateProject = vi.mocked(updateProject);
const mockDeleteReport = vi.mocked(deleteReport);
const mockUpdateInstance = vi.mocked(updateInstance);
const mockDeleteInstance = vi.mocked(deleteInstance);

describe("useProjectMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateProject.mockResolvedValue(undefined as any);
    mockDeleteReport.mockResolvedValue(undefined as any);
    mockUpdateInstance.mockResolvedValue(undefined as any);
    mockDeleteInstance.mockResolvedValue(undefined as any);
  });

  it("saves project name and exits edit mode", async () => {
    const setEditingName = vi.fn();

    const { result } = renderHook(() =>
      useProjectMutations({
        uuid: "project-1",
        name: "Renamed",
        selectedReport: undefined,
        setEditingName,
        setDeleteOpen: vi.fn(),
        setSelected: vi.fn(),
        reloadCurrent: vi.fn()
      })
    );

    await act(async () => {
      await result.current.saveName();
    });

    expect(mockUpdateProject).toHaveBeenCalledWith("project-1", "Renamed");
    expect(setEditingName).toHaveBeenCalledWith(false);
  });

  it("deletes selected report and refreshes data", async () => {
    const setDeleteOpen = vi.fn();
    const setSelected = vi.fn();
    const reloadCurrent = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useProjectMutations({
        uuid: "project-1",
        name: "Project",
        selectedReport: { uuid: "r1" } as any,
        setEditingName: vi.fn(),
        setDeleteOpen,
        setSelected,
        reloadCurrent
      })
    );

    await act(async () => {
      await result.current.onDeleteReport();
    });

    expect(mockDeleteReport).toHaveBeenCalledWith("r1");
    expect(setDeleteOpen).toHaveBeenCalledWith(false);
    expect(setSelected).toHaveBeenCalledWith("");
    expect(reloadCurrent).toHaveBeenCalled();
  });

  it("exports selected report through a download link", () => {
    if (!("createObjectURL" in URL)) {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: vi.fn()
      });
    }

    if (!("revokeObjectURL" in URL)) {
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: vi.fn()
      });
    }

    const createObjectUrlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const revokeObjectUrlSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useProjectMutations({
        uuid: "project-1",
        name: "Project",
        selectedReport: { uuid: "r1", metadata: { a: 1 } } as any,
        setEditingName: vi.fn(),
        setDeleteOpen: vi.fn(),
        setSelected: vi.fn(),
        reloadCurrent: vi.fn()
      })
    );

    act(() => {
      result.current.onExport();
    });

    expect(createObjectUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:test");

    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
    clickSpy.mockRestore();
  });

  it("updates and deletes instances with data refresh", async () => {
    const reloadCurrent = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useProjectMutations({
        uuid: "project-1",
        name: "Project",
        selectedReport: undefined,
        setEditingName: vi.fn(),
        setDeleteOpen: vi.fn(),
        setSelected: vi.fn(),
        reloadCurrent
      })
    );

    await act(async () => {
      await result.current.onUpdateInstanceNote({ uuid: "i1" } as any, "next note");
    });

    await act(async () => {
      await result.current.onDeleteInstance({ uuid: "i2" } as any);
    });

    expect(mockUpdateInstance).toHaveBeenCalledWith("i1", "next note");
    expect(mockDeleteInstance).toHaveBeenCalledWith("i2");
    expect(reloadCurrent).toHaveBeenCalledTimes(2);
  });
});
