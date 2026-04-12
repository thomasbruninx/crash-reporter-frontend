import { ActionIcon, Group, Select, Text } from "@mantine/core";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const PAGE_SIZE_OPTIONS = ["25", "50", "100"];

type TablePaginationControlsProps = {
  currentPage: number;
  total: number;
  resultsPerPage: number;
  onPageChange: (nextPage: number) => void;
  onResultsPerPageChange: (nextResultsPerPage: number) => void;
};

export function TablePaginationControls({
  currentPage,
  total,
  resultsPerPage,
  onPageChange,
  onResultsPerPageChange
}: TablePaginationControlsProps) {
  const safeResultsPerPage = resultsPerPage > 0 ? resultsPerPage : 25;
  const totalPages = Math.max(1, Math.ceil(total / safeResultsPerPage));
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const pageOptions = Array.from({ length: totalPages }, (_, i) => `${i + 1}`);

  return (
    <>
      <Group justify="space-between" mt="sm" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <Text size="sm">Current page</Text>
          <Select
            w={90}
            data={pageOptions}
            value={`${Math.min(currentPage, totalPages)}`}
            onChange={(value) => onPageChange(Number(value || "1"))}
            allowDeselect={false}
          />
        </Group>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            variant="default"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
            aria-label="Previous page"
            title="Previous page"
          >
            <NavigateBeforeIcon fontSize="small" />
          </ActionIcon>
          <ActionIcon
            variant="default"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Next page"
            title="Next page"
          >
            <NavigateNextIcon fontSize="small" />
          </ActionIcon>
        </Group>
      </Group>
      <Group mt="xs" justify="flex-start" wrap="nowrap">
        <Text size="sm">Amount per page</Text>
        <Select
          w={90}
          data={PAGE_SIZE_OPTIONS}
          value={`${safeResultsPerPage}`}
          onChange={(value) => onResultsPerPageChange(Number(value || "25"))}
          allowDeselect={false}
        />
      </Group>
    </>
  );
}
