import type { AromaCategory, AromaId } from "../../../data/aromas";

interface AromaChipGridProps {
  category: AromaCategory | undefined | null;
  selectedAromas: AromaId[];
  onToggleAroma: (aromaId: AromaId) => void;
}

const chipBase =
  "inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors select-none";

export function AromaChipGrid({ category, selectedAromas, onToggleAroma }: AromaChipGridProps) {
  if (!category) return null;

  const renderChip = (id: AromaId, label: string) => {
    const selected = selectedAromas.includes(id);
    return (
      <button
        key={id}
        type="button"
        onClick={() => onToggleAroma(id)}
        className={
          selected
            ? `${chipBase} bg-purple-900 text-white border-purple-900`
            : `${chipBase} bg-white/70 text-slate-800 border-amber-900/20 hover:bg-white`
        }
      >
        {label}
      </button>
    );
  };

  if (category.subcategories && category.subcategories.length > 0) {
    return (
      <div className="space-y-3">
        {category.subcategories.map((sub) => (
          <div key={sub.id} className="space-y-2">
            <div className="text-xs font-semibold text-slate-700">{sub.label}</div>
            <div className="flex flex-wrap gap-2">
              {sub.aromas.map((a) => renderChip(a.id, a.label))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="flex flex-wrap gap-2">{(category.aromas ?? []).map((a) => renderChip(a.id, a.label))}</div>;
}
