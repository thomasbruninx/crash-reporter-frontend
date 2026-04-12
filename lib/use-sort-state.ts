import { useCallback, useState } from "react";

export type SortDirection = "asc" | "desc";
export type SortIndicator = SortDirection | "none";

export function useSortState<TField extends string>(initialField: TField, initialDirection: SortDirection) {
  const [sortField, setSortField] = useState<TField>(initialField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const toggleSort = useCallback((field: TField, onChange?: () => void) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      onChange?.();
      return;
    }

    setSortField(field);
    setSortDirection("asc");
    onChange?.();
  }, [sortField]);

  const indicatorFor = useCallback((field: TField): SortIndicator => {
    if (field !== sortField) return "none";
    return sortDirection;
  }, [sortDirection, sortField]);

  return {
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    toggleSort,
    indicatorFor
  };
}
