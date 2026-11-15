import { Wine as WineIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { WineForm } from "./WineForm";
import type { NewWine, Wine } from "../wine";

interface WineModalProps {
  /** "add" = novo vino, "edit" = izmena i ocenjivanje postojećeg */
  mode: "add" | "edit";
  /** Vino koje se menja (samo u režimu "edit") */
  wine?: Wine | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewWine) => void;
}

/** Prozor za dodavanje novog vina ili izmenu/ocenjivanje postojećeg. */
export function WineModal({ mode, wine, open, onClose, onSubmit }: WineModalProps) {
  const isEdit = mode === "edit";
  if (isEdit && !wine) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="bg-amber-50/95 border-2 border-amber-900/30 max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={isEdit ? (e: Event) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <WineIcon className="w-5 h-5 text-purple-900" />
            <DialogTitle>{isEdit ? "Oceni vino" : "Dodaj novo vino"}</DialogTitle>
          </div>
        </DialogHeader>
        <WineForm
          key={isEdit ? wine?.id : "new"}
          mode={mode}
          initial={isEdit ? wine : null}
          onCancel={onClose}
          onSubmit={(values) => {
            onSubmit(values);
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
