import type { AromaCategory, AromaId } from "../../../data/aromas";

interface AromaChipGridProps {
  category: AromaCategory | null | undefined;
  selectedAromas: AromaId[];
  onToggleAroma: (aromaId: AromaId) => void;
  searchQuery?: string;
}

// Mobile-first smaller chip styling
const chipBase =
  "inline-flex items-center rounded-full border px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm transition-colors select-none touch-manipulation";

export function AromaChipGrid({
  category,
  selectedAromas,
  onToggleAroma,
  searchQuery = "",
}: AromaChipGridProps) {
  if (!category) {
    return (
      <div className="text-xs text-slate-500 py-2">
        {searchQuery ? "Nema aroma koje odgovaraju pretrazi" : "Izaberite kategoriju"}
      </div>
    );
  }

  const renderChip = (id: AromaId, label: string) => {
    const selected = selectedAromas.includes(id);
    return (
      <button
        key={id}
        type="button"
        onClick={() => onToggleAroma(id)}
        className={
          selected
            ? `${chipBase} bg-purple-900 text-white border-purple-900 active:bg-purple-950`
            : `${chipBase} bg-white/70 text-slate-800 border-amber-900/20 hover:bg-white active:bg-amber-50`
        }
      >
        {label}
      </button>
    );
  };

  if (category.subcategories && category.subcategories.length > 0) {
    return (
      <div className="space-y-2 sm:space-y-3">
        {category.subcategories.map((sub) => (
          <div key={sub.id} className="space-y-1.5 sm:space-y-2">
            <div className="text-xs font-semibold text-slate-700">{sub.label}</div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {sub.aromas.map((a) => renderChip(a.id, a.label))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {(category.aromas ?? []).map((a) => renderChip(a.id, a.label))}
    </div>
  );
}
