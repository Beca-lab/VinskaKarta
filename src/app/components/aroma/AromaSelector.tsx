import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import type { AromaCategory, AromaId, AromaSubcategory } from "../../../data/aromas";
import { AromaCategorySelector } from "./AromaCategorySelector";
import { AromaChipGrid } from "./AromaChipGrid";
import { SelectedAromaTags } from "./SelectedAromaTags";

interface AromaSelectorProps {
  categories: AromaCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  selectedAromas: AromaId[];
  onToggleAroma: (aromaId: AromaId) => void;
  aromaLabels: Record<AromaId, string>;
}

export function AromaSelector({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedAromas,
  onToggleAroma,
  aromaLabels,
}: AromaSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  // Create virtual "all" category containing all aromas
  const allCategoryData = useMemo(() => {
    const allSubcategories: AromaSubcategory[] = [];

    categories.forEach((cat) => {
      if (cat.subcategories) {
        cat.subcategories.forEach((sub) => {
          allSubcategories.push({
            id: `${cat.id}-${sub.id}`,
            label: `${cat.label} › ${sub.label}`,
            aromas: sub.aromas,
          });
        });
      }
      if (cat.aromas) {
        allSubcategories.push({
          id: cat.id,
          label: cat.label,
          aromas: cat.aromas,
        });
      }
    });

    return {
      id: "all",
      label: "Sve",
      subcategories: allSubcategories,
    };
  }, [categories]);

  const selectedCategoryData = useMemo(() => {
    if (selectedCategory === "all") return allCategoryData;
    return categories.find((c) => c.id === selectedCategory);
  }, [categories, selectedCategory, allCategoryData]);

  // Filter aromas based on search query
  const filteredCategoryData = useMemo(() => {
    const category = selectedCategoryData;
    if (!category) return null;

    // Helper to filter aromas
    const filterAromas = (aromas: { id: AromaId; label: string }[]) =>
      aromas.filter((a) => a.label.toLowerCase().includes(searchQuery.toLowerCase()));

    if (searchQuery.trim()) {
      if (category.subcategories && category.subcategories.length > 0) {
        const filteredSubs = category.subcategories
          .map((sub) => ({
            ...sub,
            aromas: filterAromas(sub.aromas),
          }))
          .filter((sub) => sub.aromas.length > 0);

        if (filteredSubs.length > 0) {
          return { ...category, subcategories: filteredSubs };
        }
      }

      // For categories with direct aromas (not subcategories)
      if ('aromas' in category && category.aromas && category.aromas.length > 0) {
        const filtered = filterAromas(category.aromas);
        if (filtered.length > 0) {
          return { ...category, aromas: filtered };
        }
      }

      return null;
    }

    return category;
  }, [selectedCategoryData, searchQuery]);

  return (
    <div className="space-y-3 rounded-md border border-amber-900/20 bg-white/60 p-2 sm:p-3">
      {/* Header with title and minimize button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-amber-950">Aromas</span>
          {selectedAromas.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-purple-900 text-white text-xs font-medium">
              {selectedAromas.length}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="h-8 px-2 text-slate-600 hover:text-amber-950"
        >
          {isMinimized ? (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              <span className="text-xs">Proširi</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              <span className="text-xs">Smanji</span>
            </>
          )}
        </Button>
      </div>

      {/* Selected aromas - always visible as hashtags */}
      {selectedAromas.length > 0 && (
        <div className="border-b border-amber-900/10 pb-2">
          <div className="text-xs font-medium text-slate-500 mb-1.5">
            Izabrane arome ({selectedAromas.length}):
          </div>
          <SelectedAromaTags
            selectedAromas={selectedAromas}
            aromaLabels={aromaLabels}
            onRemove={onToggleAroma}
            variant="hashtag"
          />
        </div>
      )}

      {/* Collapsible content */}
      {!isMinimized && (
        <div className="space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Pretraži arome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/80 h-9 text-sm"
            />
          </div>

          {/* Category tabs */}
          <AromaCategorySelector
            categories={categories}
            selectedCategoryId={selectedCategory}
            onSelectCategory={(id) => {
              onSelectCategory(id);
            }}
            showAllOption={true}
          />

          {/* Aroma chips */}
          <AromaChipGrid
            category={filteredCategoryData}
            selectedAromas={selectedAromas}
            onToggleAroma={onToggleAroma}
            searchQuery={searchQuery}
          />
        </div>
      )}
    </div>
  );
}
