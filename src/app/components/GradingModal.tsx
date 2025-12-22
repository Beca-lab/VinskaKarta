import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Wine } from "lucide-react";

interface Wine {
  id: number;
  name: string;
  type: string;
  vintage: string;
  region: string;
  rating?: number;
  notes?: string;
  scores?: {
    appearance: number;
    aroma: number;
    taste: number;
    finish: number;
    overall: number;
  };
}

interface GradingModalProps {
  wine: Wine | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (wineId: number, scores: GradingScores, notes: string, updatedWineInfo: Partial<Wine>) => void;
}

export interface GradingScores {
  appearance: number;
  aroma: number;
  taste: number;
  finish: number;
  overall: number;
}

export function GradingModal({ wine, open, onClose, onSubmit }: GradingModalProps) {
  const [scores, setScores] = useState<GradingScores>({
    appearance: 50,
    aroma: 50,
    taste: 50,
    finish: 50,
    overall: 50,
  });
  const [notes, setNotes] = useState("");
  const [wineInfo, setWineInfo] = useState({
    name: "",
    type: "",
    vintage: "",
    region: "",
  });

  // Update wine info and existing data when wine prop changes
  useEffect(() => {
    if (wine) {
      setWineInfo({
        name: wine.name,
        type: wine.type,
        vintage: wine.vintage,
        region: wine.region,
      });
      
      // Preserve existing notes
      setNotes(wine.notes || "");
      
      // Load existing scores if available, otherwise use defaults
      setScores(wine.scores || {
        appearance: 50,
        aroma: 50,
        taste: 50,
        finish: 50,
        overall: 50,
      });
    }
  }, [wine]);

  const handleSubmit = () => {
    if (wine) {
      onSubmit(wine.id, scores, notes, wineInfo);
      setScores({
        appearance: 50,
        aroma: 50,
        taste: 50,
        finish: 50,
        overall: 50,
      });
      setNotes("");
      onClose();
    }
  };

  const categories = [
    { key: "appearance" as keyof GradingScores, label: "Izgled", description: "Bistrina, boja i viskoznost" },
    { key: "aroma" as keyof GradingScores, label: "Aroma", description: "Miris, buket i intenzitet" },
    { key: "taste" as keyof GradingScores, label: "Ukus", description: "Aroma, balans i kompleksnost" },
    { key: "finish" as keyof GradingScores, label: "Završetak", description: "Posleukus i trajanje" },
    { key: "overall" as keyof GradingScores, label: "Ukupno", description: "Opšti utisak" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="bg-amber-50/95 border-2 border-amber-900/30 max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-purple-900" />
            <DialogTitle>Oceni Vino</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Wine Information Section */}
          <div className="space-y-4 pb-4 border-b border-amber-900/20">
            <h3 className="font-semibold text-amber-950">Informacije o Vinu</h3>
            
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ime Vina</Label>
              <Input
                id="edit-name"
                value={wineInfo.name}
                onChange={(e) => setWineInfo({ ...wineInfo, name: e.target.value })}
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Tip</Label>
              <Select
                value={wineInfo.type}
                onValueChange={(value) => setWineInfo({ ...wineInfo, type: value })}
              >
                <SelectTrigger className="bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crveno Vino">Crveno Vino</SelectItem>
                  <SelectItem value="Belo Vino">Belo Vino</SelectItem>
                  <SelectItem value="Roze Vino">Roze Vino</SelectItem>
                  <SelectItem value="Šampanjac">Šampanjac</SelectItem>
                  <SelectItem value="Pjenušavo Vino">Pjenušavo Vino</SelectItem>
                  <SelectItem value="Desertno Vino">Desertno Vino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-vintage">Godina</Label>
              <Input
                id="edit-vintage"
                type="number"
                value={wineInfo.vintage}
                onChange={(e) => setWineInfo({ ...wineInfo, vintage: e.target.value })}
                className="bg-white/80"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-region">Region</Label>
              <Input
                id="edit-region"
                value={wineInfo.region}
                onChange={(e) => setWineInfo({ ...wineInfo, region: e.target.value })}
                className="bg-white/80"
              />
            </div>
          </div>

          {/* Grading Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-amber-950">Ocenjivanje</h3>
            {categories.map((category) => (
              <div key={category.key} className="space-y-2">
                <div>
                  <Label className="text-base">{category.label}</Label>
                  <p className="text-xs text-slate-600">{category.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[scores[category.key]]}
                    onValueChange={(value) =>
                      setScores({ ...scores, [category.key]: value[0] })
                    }
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold min-w-[3ch] text-right">
                    {scores[category.key]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Beleške Degustacije</Label>
            <Textarea
              id="notes"
              placeholder="Dodajte vaše beleške ovde..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] bg-white/80"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Otkaži
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-purple-900 hover:bg-purple-800">
              Potvrdi Ocenu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}