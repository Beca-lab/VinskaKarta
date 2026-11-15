import { useMemo, type ReactNode } from "react";
import { ChartColumn } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { AROMA_CATEGORIES, buildAromaLabelIndex } from "../../data/aromas";
import { computeStats } from "../listing";
import { aromaCounts, groupStats, ratingDistribution, topWines, type CountStat, type GroupStat } from "../stats";
import { formatDecimal, type Wine } from "../wine";

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  wines: Wine[];
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-amber-950">{title}</h3>
      {children}
    </section>
  );
}

/** Red sa nazivom, trakom i vrednošću. `fraction` je dužina trake od 0 do 1. */
function BarRow({ label, value, fraction, hint }: { label: string; value: string; fraction: number; hint?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="min-w-0 break-words text-slate-800">
          {label}
          {hint ? <span className="text-xs text-slate-500"> · {hint}</span> : null}
        </span>
        <span className="shrink-0 font-semibold text-purple-900">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-amber-900/10">
        <div
          className="h-2 rounded-full bg-purple-800"
          style={{ width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function GroupList({ groups }: { groups: GroupStat[] }) {
  if (groups.length === 0) return <p className="text-xs text-slate-600">Nema podataka.</p>;
  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <BarRow
          key={group.label}
          label={group.label}
          hint={`${group.count} vina`}
          value={group.average !== undefined ? formatDecimal(group.average) : "–"}
          fraction={(group.average ?? 0) / 100}
        />
      ))}
    </div>
  );
}

function CountList({ items }: { items: CountStat[] }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <BarRow key={item.label} label={item.label} value={String(item.count)} fraction={item.count / max} />
      ))}
    </div>
  );
}

/** Pregled statistike: proseci po tipu i regionu, raspodela ocena, najbolja vina, najčešće arome. */
export function StatsModal({ open, onClose, wines }: StatsModalProps) {
  const aromaLabels = useMemo(() => buildAromaLabelIndex(AROMA_CATEGORIES), []);
  const summary = useMemo(() => computeStats(wines), [wines]);
  const byType = useMemo(() => groupStats(wines, (w) => w.type), [wines]);
  const byRegion = useMemo(() => groupStats(wines, (w) => w.region).slice(0, 8), [wines]);
  const distribution = useMemo(() => ratingDistribution(wines), [wines]);
  const best = useMemo(() => topWines(wines), [wines]);
  const aromas = useMemo(() => aromaCounts(wines, aromaLabels), [wines, aromaLabels]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="bg-amber-50/95 border-2 border-amber-900/30 max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ChartColumn className="w-5 h-5 text-purple-900" />
            <DialogTitle className="text-amber-950">Statistika</DialogTitle>
          </div>
          <DialogDescription>
            {summary.total} vina · {summary.rated} ocenjeno
            {summary.average !== undefined ? ` · prosek ${formatDecimal(summary.average)}` : ""}
          </DialogDescription>
        </DialogHeader>

        {summary.rated === 0 ? (
          <p className="py-4 text-sm text-slate-600">
            Statistika će se pojaviti kada ocenite bar jedno vino.
          </p>
        ) : (
          <div className="space-y-6 py-2">
            <Section title="Raspodela ocena">
              <CountList items={distribution} />
            </Section>

            <Section title="Najbolje ocenjena vina">
              <ol className="space-y-1">
                {best.map((wine, index) => (
                  <li key={wine.id} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="min-w-0 break-words text-slate-800">
                      {index + 1}. {wine.name || "(bez imena)"}
                      {wine.vintage ? <span className="text-xs text-slate-500"> · {wine.vintage}</span> : null}
                    </span>
                    <span className="shrink-0 font-semibold text-purple-900">
                      {wine.rating !== undefined ? formatDecimal(wine.rating) : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Prosečna ocena po tipu">
              <GroupList groups={byType} />
            </Section>

            <Section title="Prosečna ocena po regionu">
              <GroupList groups={byRegion} />
            </Section>

            {aromas.length > 0 ? (
              <Section title="Najčešće arome">
                <CountList items={aromas} />
              </Section>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
