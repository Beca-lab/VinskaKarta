import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Crveno dugme za potvrdu (brisanje, odbacivanje izmena) */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Prozor za potvrdu u stilu aplikacije (umesto sistemskog window.confirm). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Otkaži",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="bg-amber-50 border-2 border-amber-900/30 max-w-[90vw] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-amber-950">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11">
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={
              destructive
                ? "flex-1 h-11 bg-red-700 hover:bg-red-600 text-white"
                : "flex-1 h-11 bg-purple-900 hover:bg-purple-800"
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
