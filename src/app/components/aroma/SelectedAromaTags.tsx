import type { AromaId } from "../../../data/aromas";

interface SelectedAromaTagsProps {
  selectedAromas: AromaId[];
  aromaLabels: Record<AromaId, string>;
  onRemove: (aromaId: AromaId) => void;
  variant?: "default" | "hashtag";
}

export function SelectedAromaTags({
  selectedAromas,
  aromaLabels,
  onRemove,
  variant = "default",
}: SelectedAromaTagsProps) {
  if (selectedAromas.length === 0) {
    return <div className="text-xs text-slate-600">Nema izabranih aroma</div>;
  }

  if (variant === "hashtag") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {selectedAromas.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onRemove(id)}
            className="inline-flex items-center gap-1 rounded-md bg-purple-100 border border-purple-300 px-2 py-1 text-xs font-medium text-purple-900 hover:bg-purple-200 transition-colors"
          >
            <span className="text-purple-600">#</span>
            <span>{aromaLabels[id] ?? id}</span>
            <span className="text-purple-500 ml-0.5">×</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {selectedAromas.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onRemove(id)}
          className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-white/70 px-3 py-1.5 text-sm text-slate-800 hover:bg-white"
        >
          <span>{aromaLabels[id] ?? id}</span>
          <span className="text-slate-500">×</span>
        </button>
      ))}
    </div>
  );
}
