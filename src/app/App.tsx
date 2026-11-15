import { useState, useEffect, useMemo } from "react";
import { WineCard } from "./components/WineCard";
import { WineModal } from "./components/WineModal";
import { BackupModal } from "./components/BackupModal";
import { VineCorner } from "./components/VineCorner";
import { Wine as WineIcon, Award, Plus, ListFilter, DatabaseBackup } from "lucide-react";
import { Button } from "./components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { AROMA_CATEGORIES, buildAromaLabelIndex, type AromaId } from "../data/aromas";
import { loadWines, saveWines } from "./storage";
import { computeRating, type NewWine, type Wine } from "./wine";

// Primeri vina za prvo pokretanje (dok još ništa nije sačuvano)
const getDefaultWines = (): Wine[] => {
  return [
    {
      id: 1,
      name: "Château Margaux",
      type: "Crveno Vino",
      vintage: "2015",
      region: "Bordeaux, Francuska",
    },
    {
      id: 2,
      name: "Cloudy Bay Sauvignon Blanc",
      type: "Belo Vino",
      vintage: "2022",
      region: "Marlborough, Novi Zeland",
    },
    {
      id: 3,
      name: "Dom Pérignon",
      type: "Šampanjac",
      vintage: "2012",
      region: "Épernay, Francuska",
    },
    {
      id: 4,
      name: "Opus One",
      type: "Crveno Vino",
      vintage: "2018",
      region: "Napa Valley, SAD",
    },
    {
      id: 5,
      name: "Penfolds Grange",
      type: "Crveno Vino",
      vintage: "2016",
      region: "Južna Australija",
    },
    {
      id: 6,
      name: "Sassicaia",
      type: "Crveno Vino",
      vintage: "2019",
      region: "Toskana, Italija",
    },
  ];
};

export default function App() {
  const [wines, setWines] = useState<Wine[]>(() => loadWines() ?? getDefaultWines());

  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [aromaFilter, setAromaFilter] = useState<AromaId | "all">("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  const aromaLabels = useMemo(() => buildAromaLabelIndex(AROMA_CATEGORIES), []);

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
      };
      return [...prev, wine];
    });
  };

  const handleDeleteWine = (wineId: number) => {
    setWines((prev) => prev.filter(wine => wine.id !== wineId));
  };

  const handleImportWines = (imported: Wine[]) => {
    // Ocena se računa ponovo iz sačuvanih poena, da bude usklađena sa trenutnom formulom
    setWines(imported.map((w) => (w.scores ? { ...w, rating: computeRating(w.scores) } : w)));
    setTypeFilter("all");
    setRegionFilter("all");
    setAromaFilter("all");
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
  const filteredAndSortedWines = wines
    .filter(wine => {
      const typeMatch = typeFilter === "all" || wine.type === typeFilter;
      const regionMatch = regionFilter === "all" || wine.region === regionFilter;
      const aromaMatch = aromaFilter === "all" || (wine.aromas && wine.aromas.includes(aromaFilter));
      return typeMatch && regionMatch && aromaMatch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return b.id - a.id; // Newest first
      } else if (sortOrder === "best") {
        // Best to worst (rated wines first, then by rating)
        if (a.rating === undefined && b.rating === undefined) return b.id - a.id;
        if (a.rating === undefined) return 1;
        if (b.rating === undefined) return -1;
        return b.rating - a.rating;
      } else if (sortOrder === "worst") {
        // Worst to best
        if (a.rating === undefined && b.rating === undefined) return b.id - a.id;
        if (a.rating === undefined) return 1;
        if (b.rating === undefined) return -1;
        return a.rating - b.rating;
      }
      return 0;
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
                  <h1 className="text-2xl sm:text-3xl md:text-4xl text-amber-950 tracking-wide">Ocenjivanje Vina</h1>
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                </div>
                <p className="text-sm sm:text-base text-slate-600">Profesionalna degustacija i evaluacija</p>
              </div>

              {/* Filters Section */}
              <div className="mb-4 sm:mb-6 bg-amber-50/50 border border-amber-900/20 rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <ListFilter className="w-4 h-4 text-amber-900" />
                  <h2 className="text-sm sm:text-base font-semibold text-amber-950">Filteri i Sortiranje</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs sm:text-sm text-slate-600 mb-1 block">Tip Vina</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="bg-white/80 h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wineTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === "all" ? "Svi Tipovi" : type}
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
                            {region === "all" ? "Svi Regioni" : region}
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
                            {aroma === "all" ? "Sve Arome" : (aromaLabels[aroma] || aroma)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs sm:text-sm text-slate-600 mb-1 block">Sortiraj Po</label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="bg-white/80 h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Najnovije Prvo</SelectItem>
                        <SelectItem value="best">Od Najboljih ka Najgorim</SelectItem>
                        <SelectItem value="worst">Od Najgorih ka Najboljim</SelectItem>
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
                  Dodaj Novo Vino
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsBackupModalOpen(true)}
                  className="bg-white/70 border-amber-900/30 text-amber-950 shadow-sm w-full sm:w-auto h-11 sm:h-10"
                >
                  <DatabaseBackup className="w-4 h-4 mr-2" />
                  Rezervna Kopija
                </Button>
              </div>

              {/* Wine Cards - Single Column */}
              <div className="space-y-3 sm:space-y-4">
                {filteredAndSortedWines.length > 0 ? (
                  filteredAndSortedWines.map((wine) => (
                    <WineCard
                      key={wine.id}
                      name={wine.name}
                      type={wine.type}
                      vintage={wine.vintage}
                      region={wine.region}
                      composition={wine.composition}
                      variety={wine.variety}
                      blend={wine.blend}
                      aromas={wine.aromas}
                      rating={wine.rating}
                      onRate={() => handleRateWine(wine)}
                      onDelete={() => handleDeleteWine(wine.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm sm:text-base">
                    Nema vina koja odgovaraju vašim filterima
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500">
                Kliknite na bilo koju karticu da ocenite vino
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Izmena / ocenjivanje vina */}
      <WineModal
        mode="edit"
        wine={selectedWine}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values) => selectedWine && handleUpdateWine(selectedWine.id, values)}
      />

      {/* Dodavanje vina */}
      <WineModal
        mode="add"
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddWine}
      />

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