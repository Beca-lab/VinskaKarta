import { useState, useEffect, useMemo } from "react";
import { WineCard } from "./components/WineCard";
import { WineModal } from "./components/WineModal";
import { BackupModal } from "./components/BackupModal";
import { VineCorner } from "./components/VineCorner";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Wine as WineIcon, Award, Plus, ListFilter, DatabaseBackup, Search } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { AROMA_CATEGORIES, buildAromaLabelIndex, type AromaId } from "../data/aromas";
import {
  computeStats,
  DEFAULT_LIST_OPTIONS,
  filterAndSortWines,
  type RatedFilter,
  type SortOrder,
} from "./listing";
import { loadWines, saveWines } from "./storage";
import { collectSuggestions, computeRating, formatDecimal, type NewWine, type Wine } from "./wine";

export default function App() {
  const [wines, setWines] = useState<Wine[]>(() => loadWines() ?? []);

  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [wineToDelete, setWineToDelete] = useState<Wine | null>(null);
  const [lastDeleted, setLastDeleted] = useState<{ wine: Wine; index: number } | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [aromaFilter, setAromaFilter] = useState<AromaId | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratedFilter, setRatedFilter] = useState<RatedFilter>("all");

  const aromaLabels = useMemo(() => buildAromaLabelIndex(AROMA_CATEGORIES), []);
  const suggestions = useMemo(() => collectSuggestions(wines), [wines]);
  const stats = useMemo(() => computeStats(wines), [wines]);

  // Save wines to localStorage whenever they change
  useEffect(() => {
    saveWines(wines);
  }, [wines]);

  const handleRateWine = (wine: Wine) => {
    setSelectedWine(wine);
    setIsModalOpen(true);
  };

  const handleUpdateWine = (wineId: number, values: NewWine) => {
    const rating = values.scores ? computeRating(values.scores) : undefined;
    setWines((prev) => prev.map((wine) => (wine.id === wineId ? { ...wine, ...values, rating } : wine)));
  };

  const handleAddWine = (newWine: NewWine) => {
    const rating = newWine.scores ? computeRating(newWine.scores) : undefined;
    setWines((prev) => {
      const wine: Wine = {
        id: prev.length > 0 ? Math.max(...prev.map(w => w.id)) + 1 : 1,
        ...newWine,
        rating,
        createdAt: new Date().toISOString(),
      };
      return [...prev, wine];
    });
  };

  const handleDeleteWine = (wineId: number) => {
    const index = wines.findIndex((wine) => wine.id === wineId);
    if (index === -1) return;
    setLastDeleted({ wine: wines[index], index });
    setWines((prev) => prev.filter((wine) => wine.id !== wineId));
  };

  const handleUndoDelete = () => {
    if (!lastDeleted) return;
    const { wine, index } = lastDeleted;
    setWines((prev) => {
      if (prev.some((w) => w.id === wine.id)) return prev;
      const next = prev.slice();
      next.splice(Math.min(index, next.length), 0, wine);
      return next;
    });
    setLastDeleted(null);
  };

  // Poruka "Poništi" posle brisanja nestaje sama posle nekoliko sekundi
  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => setLastDeleted(null), 8000);
    return () => clearTimeout(timer);
  }, [lastDeleted]);

  const handleImportWines = (imported: Wine[]) => {
    // Ocena se računa ponovo iz sačuvanih poena, da bude usklađena sa trenutnom formulom
    setWines(imported.map((w) => (w.scores ? { ...w, rating: computeRating(w.scores) } : w)));
    setTypeFilter("all");
    setRegionFilter("all");
    setAromaFilter("all");
    setRatedFilter("all");
    setSearchQuery("");
  };

  // Get unique types, regions and aromas for filters
  const wineTypes = [
    "all",
    ...Array.from(new Set(wines.map(w => w.type).filter((v): v is string => Boolean(v && v.trim())))),
  ];
  const wineRegions = [
    "all",
    ...Array.from(new Set(wines.map(w => w.region).filter((v): v is string => Boolean(v && v.trim())))),
  ];
  const wineAromas = useMemo(() => {
    const allAromas = new Set<AromaId>();
    wines.forEach(wine => {
      if (wine.aromas && wine.aromas.length > 0) {
        wine.aromas.forEach(aroma => allAromas.add(aroma));
      }
    });
    return ["all" as const, ...Array.from(allAromas)];
  }, [wines]);

  // Filter and sort wines
  const filteredAndSortedWines = filterAndSortWines(wines, {
    ...DEFAULT_LIST_OPTIONS,
    search: searchQuery,
    type: typeFilter,
    region: regionFilter,
    aroma: aromaFilter,
    rated: ratedFilter,
    sort: sortOrder,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 p-3 sm:p-4 md:p-8">
      {/* Wooden Frame */}
      <div className="max-w-4xl mx-auto">
        {/* Outer wooden border with elegant grape vine corners */}
        <div className="bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900 p-2 sm:p-3 md:p-4 rounded-lg shadow-2xl relative">
          
          <VineCorner corner="top-left" />
          <VineCorner corner="top-right" />
          <VineCorner corner="bottom-left" />
          <VineCorner corner="bottom-right" />

          {/* Inner wooden border with texture effect */}
          <div className="bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 p-1.5 sm:p-2 rounded-md shadow-inner relative z-10">
            {/* Main content area - wooden board */}
            <div 
              className="bg-amber-100 rounded-sm shadow-xl min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-8rem)] p-4 sm:p-6 md:p-8"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    90deg,
                    rgba(120, 53, 15, 0.03) 0px,
                    rgba(120, 53, 15, 0.03) 2px,
                    transparent 2px,
                    transparent 12px
                  ),
                  repeating-linear-gradient(
                    0deg,
                    rgba(120, 53, 15, 0.02) 0px,
                    rgba(120, 53, 15, 0.02) 1px,
                    transparent 1px,
                    transparent 8px
                  ),
                  linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)
                `,
              }}
            >
              {/* Header */}
              <div className="mb-6 sm:mb-8 text-center">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                  <WineIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-900" />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl text-amber-950 tracking-wide">Wine Card</h1>
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                </div>
                <p className="text-sm sm:text-base text-slate-600">Profesionalna degustacija i evaluacija</p>
                {stats.total > 0 ? (
                  <p className="mt-2 text-xs sm:text-sm text-amber-900">
                    {stats.total} vina · {stats.rated} ocenjeno
                    {stats.average !== undefined ? ` · prosek ${formatDecimal(stats.average)}` : ""}
                  </p>
                ) : null}
              </div>

              {/* Filters Section */}
              <div className="mb-4 sm:mb-6 bg-amber-50/50 border border-amber-900/20 rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <ListFilter className="w-4 h-4 text-amber-900" />
                  <h2 className="text-sm sm:text-base font-semibold text-amber-950">Filteri i sortiranje</h2>
                </div>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pretraži po imenu, vinariji, regionu, sorti..."
                    aria-label="Pretraga vina"
                    className="bg-white/80 h-10 sm:h-11 pl-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 [&>div]:min-w-0 [&_button]:min-w-0 [&_button]:overflow-hidden">
                  <div>
                    <label className="text-xs sm:text-sm text-slate-600 mb-1 block">Tip vina</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="bg-white/80 h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wineTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === "all" ? "Svi tipovi" : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-slate-600 mb-1 block">Region</label>
                    <Select value={regionFilter} onValueChange={setRegionFilter}>
                      <SelectTrigger className="bg-white/80 h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wineRegions.map(region => (
                          <SelectItem key={region} value={region}>
                            {region === "all" ? "Svi regioni" : region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-slate-600 mb-1 block">Aroma</label>
                    <Select value={aromaFilter} onValueChange={(value) => setAromaFilter(value as AromaId | "all")}>
                      <SelectTrigger className="bg-white/80 h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wineAromas.map(aroma => (
                          <SelectItem key={aroma} value={aroma}>
                            {aroma === "all" ? "Sve arome" : (aromaLabels[aroma] || aroma)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-slate-600 mb-1 block">Ocena</label>
                    <Select value={ratedFilter} onValueChange={(value) => setRatedFilter(value as RatedFilter)}>
                      <SelectTrigger className="bg-white/80 h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Sva vina</SelectItem>
                        <SelectItem value="rated">Samo ocenjena</SelectItem>
                        <SelectItem value="unrated">Samo neocenjena</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs sm:text-sm text-slate-600 mb-1 block">Sortiraj po</label>
                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                      <SelectTrigger className="bg-white/80 h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Najnovije prvo</SelectItem>
                        <SelectItem value="best">Od najboljih ka najgorim</SelectItem>
                        <SelectItem value="worst">Od najgorih ka najboljim</SelectItem>
                        <SelectItem value="name">Po imenu (A–Š)</SelectItem>
                        <SelectItem value="vintage">Po godini berbe (novije prvo)</SelectItem>
                        <SelectItem value="tasted">Po datumu degustacije (novije prvo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Add Wine + Backup Buttons */}
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-center gap-2">
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-purple-900 hover:bg-purple-800 shadow-md w-full sm:w-auto h-11 sm:h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj novo vino
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsBackupModalOpen(true)}
                  className="bg-white/70 border-amber-900/30 text-amber-950 shadow-sm w-full sm:w-auto h-11 sm:h-10"
                >
                  <DatabaseBackup className="w-4 h-4 mr-2" />
                  Rezervna kopija
                </Button>
              </div>

              {/* Wine Cards - Single Column */}
              <div className="space-y-3 sm:space-y-4">
                {filteredAndSortedWines.length > 0 ? (
                  filteredAndSortedWines.map((wine) => (
                    <WineCard
                      key={wine.id}
                      wine={wine}
                      onRate={() => handleRateWine(wine)}
                      onDelete={() => setWineToDelete(wine)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm sm:text-base">
                    {wines.length === 0
                      ? "Još nema vina. Dodirnite „Dodaj novo vino“ da unesete prvo."
                      : "Nema vina koja odgovaraju pretrazi i filterima"}
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500">
                Dodirnite karticu da izmenite ili ocenite vino
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Izmena / ocenjivanje vina */}
      <WineModal
        mode="edit"
        wine={selectedWine}
        suggestions={suggestions}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values) => selectedWine && handleUpdateWine(selectedWine.id, values)}
      />

      {/* Dodavanje vina */}
      <WineModal
        mode="add"
        suggestions={suggestions}
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddWine}
      />

      {/* Potvrda brisanja */}
      <ConfirmDialog
        open={wineToDelete !== null}
        title="Obrisati vino?"
        description={wineToDelete ? `„${wineToDelete.name}“ će biti uklonjeno sa liste.` : undefined}
        confirmLabel="Obriši"
        destructive
        onCancel={() => setWineToDelete(null)}
        onConfirm={() => {
          if (wineToDelete) handleDeleteWine(wineToDelete.id);
          setWineToDelete(null);
        }}
      />

      {/* Poništavanje brisanja */}
      {lastDeleted ? (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-between gap-3 rounded-lg bg-stone-900 px-4 py-2 text-sm text-amber-50 shadow-xl"
        >
          <span className="min-w-0 truncate">Obrisano: {lastDeleted.wine.name}</span>
          <Button
            type="button"
            variant="ghost"
            onClick={handleUndoDelete}
            className="h-9 shrink-0 px-3 font-semibold text-amber-300 hover:bg-white/10 hover:text-amber-200"
          >
            Poništi
          </Button>
        </div>
      ) : null}

      {/* Backup Modal */}
      <BackupModal
        open={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        wines={wines}
        onImport={handleImportWines}
      />
    </div>
  );
}