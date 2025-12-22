import { useState, useEffect } from "react";
import { WineCard } from "./components/WineCard";
import { GradingModal, GradingScores } from "./components/GradingModal";
import { AddWineModal, NewWine } from "./components/AddWineModal";
import { Wine, Award, Plus, ListFilter } from "lucide-react";
import { Button } from "./components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

interface Wine {
  id: number;
  name: string;
  type: string;
  vintage: string;
  region: string;
  rating?: number;
  notes?: string;
}

const STORAGE_KEY = 'wine-app-data';

// Load wines from localStorage
const loadWinesFromStorage = (): Wine[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading wines from storage:', error);
  }
  
  // Default wines if nothing in storage
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
  const [wines, setWines] = useState<Wine[]>(loadWinesFromStorage);

  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  // Save wines to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
    } catch (error) {
      console.error('Error saving wines to storage:', error);
    }
  }, [wines]);

  const handleRateWine = (wine: Wine) => {
    setSelectedWine(wine);
    setIsModalOpen(true);
  };

  const handleSubmitGrade = (wineId: number, scores: GradingScores, notes: string, updatedWineInfo: Partial<Wine>) => {
    const totalScore =
      (scores.appearance + scores.aroma + scores.taste + scores.finish + scores.overall) / 5;
    
    setWines(wines.map((wine) => 
      wine.id === wineId 
        ? { ...wine, ...updatedWineInfo, rating: totalScore, notes } 
        : wine
    ));
  };

  const handleAddWine = (newWine: NewWine) => {
    const wine: Wine = {
      id: wines.length > 0 ? Math.max(...wines.map(w => w.id)) + 1 : 1,
      ...newWine,
    };
    setWines([...wines, wine]);
  };

  const handleDeleteWine = (wineId: number) => {
    setWines(wines.filter(wine => wine.id !== wineId));
  };

  // Get unique types and regions for filters
  const wineTypes = ["all", ...Array.from(new Set(wines.map(w => w.type)))];
  const wineRegions = ["all", ...Array.from(new Set(wines.map(w => w.region)))];

  // Filter and sort wines
  const filteredAndSortedWines = wines
    .filter(wine => {
      const typeMatch = typeFilter === "all" || wine.type === typeFilter;
      const regionMatch = regionFilter === "all" || wine.region === regionFilter;
      return typeMatch && regionMatch;
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
          
          {/* Top Left Corner Decoration */}
          <div className="absolute top-2 left-2 w-24 h-24 pointer-events-none z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Main vine branch */}
              <path d="M5,95 Q15,75 25,65 Q35,55 45,45 Q55,35 65,25 Q75,15 95,5" 
                    stroke="#4a5d23" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              
              {/* Grape cluster */}
              <circle cx="35" cy="55" r="5" fill="#7c3aed" opacity="0.9"/>
              <circle cx="42" cy="53" r="5" fill="#8b5cf6" opacity="0.9"/>
              <circle cx="28" cy="53" r="5" fill="#6d28d9" opacity="0.9"/>
              <circle cx="35" cy="48" r="5" fill="#7c3aed" opacity="0.9"/>
              <circle cx="35" cy="62" r="5" fill="#6d28d9" opacity="0.9"/>
              <circle cx="42" cy="60" r="4.5" fill="#8b5cf6" opacity="0.85"/>
              <circle cx="28" cy="60" r="4.5" fill="#6d28d9" opacity="0.85"/>
              
              {/* Leaves */}
              <path d="M50,40 Q55,35 60,40 Q65,45 60,50 Q55,55 50,50 Q45,45 50,40" 
                    fill="#4d7c0f" opacity="0.8"/>
              <path d="M20,70 Q25,65 30,70 Q35,75 30,80 Q25,85 20,80 Q15,75 20,70" 
                    fill="#65a30d" opacity="0.8"/>
              <path d="M68,28 Q73,23 78,28 Q83,33 78,38 Q73,43 68,38 Q63,33 68,28" 
                    fill="#4d7c0f" opacity="0.75"/>
            </svg>
          </div>

          {/* Top Right Corner Decoration */}
          <div className="absolute top-2 right-2 w-24 h-24 pointer-events-none z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full transform scale-x-[-1]">
              <path d="M5,95 Q15,75 25,65 Q35,55 45,45 Q55,35 65,25 Q75,15 95,5" 
                    stroke="#4a5d23" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              
              <circle cx="35" cy="55" r="5" fill="#7c3aed" opacity="0.9"/>
              <circle cx="42" cy="53" r="5" fill="#8b5cf6" opacity="0.9"/>
              <circle cx="28" cy="53" r="5" fill="#6d28d9" opacity="0.9"/>
              <circle cx="35" cy="48" r="5" fill="#7c3aed" opacity="0.9"/>
              <circle cx="35" cy="62" r="5" fill="#6d28d9" opacity="0.9"/>
              <circle cx="42" cy="60" r="4.5" fill="#8b5cf6" opacity="0.85"/>
              <circle cx="28" cy="60" r="4.5" fill="#6d28d9" opacity="0.85"/>
              
              <path d="M50,40 Q55,35 60,40 Q65,45 60,50 Q55,55 50,50 Q45,45 50,40" 
                    fill="#4d7c0f" opacity="0.8"/>
              <path d="M20,70 Q25,65 30,70 Q35,75 30,80 Q25,85 20,80 Q15,75 20,70" 
                    fill="#65a30d" opacity="0.8"/>
              <path d="M68,28 Q73,23 78,28 Q83,33 78,38 Q73,43 68,38 Q63,33 68,28" 
                    fill="#4d7c0f" opacity="0.75"/>
            </svg>
          </div>

          {/* Bottom Left Corner Decoration */}
          <div className="absolute bottom-2 left-2 w-24 h-24 pointer-events-none z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full transform scale-y-[-1]">
              <path d="M5,95 Q15,75 25,65 Q35,55 45,45 Q55,35 65,25 Q75,15 95,5" 
                    stroke="#4a5d23" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              
              <circle cx="35" cy="55" r="5" fill="#7c3aed" opacity="0.9"/>
              <circle cx="42" cy="53" r="5" fill="#8b5cf6" opacity="0.9"/>
              <circle cx="28" cy="53" r="5" fill="#6d28d9" opacity="0.9"/>
              <circle cx="35" cy="48" r="5" fill="#7c3aed" opacity="0.9"/>
              <circle cx="35" cy="62" r="5" fill="#6d28d9" opacity="0.9"/>
              <circle cx="42" cy="60" r="4.5" fill="#8b5cf6" opacity="0.85"/>
              <circle cx="28" cy="60" r="4.5" fill="#6d28d9" opacity="0.85"/>
              
              <path d="M50,40 Q55,35 60,40 Q65,45 60,50 Q55,55 50,50 Q45,45 50,40" 
                    fill="#4d7c0f" opacity="0.8"/>
              <path d="M20,70 Q25,65 30,70 Q35,75 30,80 Q25,85 20,80 Q15,75 20,70" 
                    fill="#65a30d" opacity="0.8"/>
              <path d="M68,28 Q73,23 78,28 Q83,33 78,38 Q73,43 68,38 Q63,33 68,28" 
                    fill="#4d7c0f" opacity="0.75"/>
            </svg>
          </div>

          {/* Bottom Right Corner Decoration */}
          <div className="absolute bottom-2 right-2 w-24 h-24 pointer-events-none z-10">
            <svg viewBox="0 0 100 100" className="w-full h-full transform scale-[-1]">
              <path d="M5,95 Q15,75 25,65 Q35,55 45,45 Q55,35 65,25 Q75,15 95,5" 
                    stroke="#4a5d23" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              
              <circle cx="35" cy="55" r="5" fill="#7c3aed" opacity="0.9"/>
              <circle cx="42" cy="53" r="5" fill="#8b5cf6" opacity="0.9"/>
              <circle cx="28" cy="53" r="5" fill="#6d28d9" opacity="0.9"/>
              <circle cx="35" cy="48" r="5" fill="#7c3aed" opacity="0.9"/>
              <circle cx="35" cy="62" r="5" fill="#6d28d9" opacity="0.9"/>
              <circle cx="42" cy="60" r="4.5" fill="#8b5cf6" opacity="0.85"/>
              <circle cx="28" cy="60" r="4.5" fill="#6d28d9" opacity="0.85"/>
              
              <path d="M50,40 Q55,35 60,40 Q65,45 60,50 Q55,55 50,50 Q45,45 50,40" 
                    fill="#4d7c0f" opacity="0.8"/>
              <path d="M20,70 Q25,65 30,70 Q35,75 30,80 Q25,85 20,80 Q15,75 20,70" 
                    fill="#65a30d" opacity="0.8"/>
              <path d="M68,28 Q73,23 78,28 Q83,33 78,38 Q73,43 68,38 Q63,33 68,28" 
                    fill="#4d7c0f" opacity="0.75"/>
            </svg>
          </div>

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
                  <Wine className="w-6 h-6 sm:w-8 sm:h-8 text-purple-900" />
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

              {/* Add Wine Button */}
              <div className="mb-4 sm:mb-6 flex justify-center">
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-purple-900 hover:bg-purple-800 shadow-md w-full sm:w-auto h-11 sm:h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj Novo Vino
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

      {/* Grading Modal */}
      <GradingModal
        wine={selectedWine}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitGrade}
      />

      {/* Add Wine Modal */}
      <AddWineModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddWine}
      />
    </div>
  );
}