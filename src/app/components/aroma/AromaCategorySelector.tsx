import { Button } from "../ui/button";
import type { AromaCategory } from "../../../data/aromas";

interface AromaCategorySelectorProps {
  categories: AromaCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  showAllOption?: boolean;
}

export function AromaCategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showAllOption = true,
}: AromaCategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {showAllOption && (
        <Button
          type="button"
          variant={selectedCategoryId === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory("all")}
          className={
            selectedCategoryId === "all"
              ? "shrink-0 bg-purple-900 hover:bg-purple-800 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              : "shrink-0 bg-white/70 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          }
        >
          Sve
        </Button>
      )}
      {categories.map((cat) => {
        const selected = cat.id === selectedCategoryId;
        return (
          <Button
            key={cat.id}
            type="button"
            variant={selected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(cat.id)}
            className={
              selected
                ? "shrink-0 bg-purple-900 hover:bg-purple-800 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                : "shrink-0 bg-white/70 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            }
          >
            {cat.label}
          </Button>
        );
      })}
    </div>
  );
}
