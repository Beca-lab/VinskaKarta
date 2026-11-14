import { useRef, useState, type ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Copy, Download, FileUp, Upload } from "lucide-react";
import type { Wine } from "../wine";

interface BackupModalProps {
  open: boolean;
  onClose: () => void;
  wines: Wine[];
  onImport: (wines: Wine[]) => void;
}

type Status = { kind: "ok" | "error"; text: string } | null;

const buildExportJson = (wines: Wine[]) =>
  JSON.stringify(
    { app: "vinska-karta", version: 1, exportedAt: new Date().toISOString(), wines },
    null,
    2
  );

/** Prihvata i novi format ({ wines: [...] }) i običan niz vina (stari localStorage format). */
export const parseBackup = (text: string): Wine[] => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Tekst nije ispravan JSON.");
  }
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { wines?: unknown }).wines)
      ? (data as { wines: unknown[] }).wines
      : null;
  if (!list) throw new Error("U rezervnoj kopiji nije pronađena lista vina.");

  const wines: Wine[] = [];
  const usedIds = new Set<number>();
  let nextId = 1;
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const w = item as Partial<Wine>;
    if (typeof w.name !== "string" || !w.name.trim()) continue;
    let id = typeof w.id === "number" && Number.isFinite(w.id) ? w.id : NaN;
    if (Number.isNaN(id) || usedIds.has(id)) {
      while (usedIds.has(nextId)) nextId++;
      id = nextId;
    }
    usedIds.add(id);
    wines.push({ ...(w as Wine), id });
  }
  if (list.length > 0 && wines.length === 0) {
    throw new Error("Nijedno vino u rezervnoj kopiji nema ispravan format.");
  }
  return wines;
};

const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // probaj stari način ispod
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
};

export function BackupModal({ open, onClose, wines, onImport }: BackupModalProps) {
  const [importText, setImportText] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setImportText("");
    setStatus(null);
    onClose();
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(buildExportJson(wines));
    setStatus(
      ok
        ? { kind: "ok", text: `Kopirano ${wines.length} vina. Nalepite tekst u beleške, e-mail ili poruku i sačuvajte ga.` }
        : { kind: "error", text: "Kopiranje nije uspelo na ovom uređaju." }
    );
  };

  const handleDownload = () => {
    const blob = new Blob([buildExportJson(wines)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `vinska-karta-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus({ kind: "ok", text: "Fajl je poslat na preuzimanje. Ako se ništa ne desi (npr. na telefonu), koristite \"Kopiraj\"." });
  };

  const doImport = (text: string) => {
    try {
      const parsed = parseBackup(text);
      const ok = window.confirm(
        `Uvesti ${parsed.length} vina? Ovo će ZAMENITI trenutnu listu (${wines.length} vina).`
      );
      if (!ok) return;
      onImport(parsed);
      setImportText("");
      setStatus({ kind: "ok", text: `Uvezeno ${parsed.length} vina.` });
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Uvoz nije uspeo." });
    }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => doImport(String(reader.result ?? ""));
    reader.onerror = () => setStatus({ kind: "error", text: "Fajl nije moguće pročitati." });
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-amber-50/95 border-2 border-amber-900/30 max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-950">Rezervna kopija</DialogTitle>
          <DialogDescription>
            Vina se čuvaju samo na ovom uređaju. Napravite kopiju da ih ne izgubite pri brisanju ili reinstalaciji aplikacije.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-amber-950">Izvoz ({wines.length} vina)</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" onClick={handleCopy} className="bg-purple-900 hover:bg-purple-800 h-11">
                <Copy className="w-4 h-4 mr-2" />
                Kopiraj
              </Button>
              <Button type="button" variant="outline" onClick={handleDownload} className="h-11">
                <Download className="w-4 h-4 mr-2" />
                Preuzmi fajl
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-amber-950">Uvoz</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-11"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Izaberi .json fajl
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json,text/plain"
              className="hidden"
              onChange={handleFile}
            />
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="...ili ovde nalepite kopirani tekst"
              className="bg-white/80 min-h-[90px] text-xs font-mono"
            />
            <Button
              type="button"
              onClick={() => doImport(importText)}
              disabled={!importText.trim()}
              className="w-full bg-purple-900 hover:bg-purple-800 h-11"
            >
              <Upload className="w-4 h-4 mr-2" />
              Uvezi nalepljeni tekst
            </Button>
          </section>

          {status ? (
            <p className={`text-sm ${status.kind === "ok" ? "text-green-800" : "text-red-700"}`}>{status.text}</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
