import { ActionToolbar } from "@/components/toolbars/action-toolbar";
import { Button } from "@mantine/core";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import VisibilityIcon from "@mui/icons-material/Visibility";

type ReportActionsToolbarProps = {
  hasSelection: boolean;
  onView: () => void;
  onExport: () => void;
  onDelete: () => void;
  onManageInstances: () => void;
};

export function ReportActionsToolbar({
  hasSelection,
  onView,
  onExport,
  onDelete,
  onManageInstances
}: ReportActionsToolbarProps) {
  return (
    <ActionToolbar>
      <Button variant="default" leftSection={<VisibilityIcon fontSize="small" />} disabled={!hasSelection} onClick={onView}>
        View
      </Button>
      <Button variant="default" leftSection={<DownloadIcon fontSize="small" />} disabled={!hasSelection} onClick={onExport}>
        Export
      </Button>
      <Button color="red" variant="light" leftSection={<DeleteOutlineIcon fontSize="small" />} disabled={!hasSelection} onClick={onDelete}>
        Delete
      </Button>
      <Button leftSection={<SettingsIcon fontSize="small" />} onClick={onManageInstances}>
        Manage instances
      </Button>
    </ActionToolbar>
  );
}
