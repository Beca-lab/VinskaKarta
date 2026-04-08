import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Textarea } from "./ui/textarea";
import { GradingScores } from "./GradingModal";
import { Wine, Plus, Trash2 } from "lucide-react";
import {
  AROMA_CATEGORIES,
  buildAromaLabelIndex,
  DEFAULT_AROMA_CATEGORY_ID,
  type AromaId,
} from "../../data/aromas";
import { AromaSelector } from "./aroma/AromaSelector";

interface AddWineModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (wine: NewWine) => void;
}

export interface NewWine {
  name: string;
  type?: string;
  composition?: "Cisto" | "Kupaza";
  variety?: string;
  blend?: Array<{ grape: string; percent: number }>;
  vintage?: string;
  region?: string;
  scores?: GradingScores;
  aromas?: AromaId[];
  notes?: string;
}

type BlendComponentInput = {
  grape: string;
  percent: string;
};

export function AddWineModal({ open, onClose, onSubmit }: AddWineModalProps) {
  const defaultScores: GradingScores = {
    appearance: 50,
    taste: 50,
    finish: 50,
    overall: 50,
  };

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    vintage: "",
    region: "",
  });

  const [composition, setComposition] = useState<"" | "Cisto" | "Kupaza">("");
  const [variety, setVariety] = useState("");
  const [blend, setBlend] = useState<BlendComponentInput[]>([
    { grape: "", percent: "" },
    { grape: "", percent: "" },
  ]);

  const [includeGrading, setIncludeGrading] = useState(false);
  const [scores, setScores] = useState<GradingScores>(defaultScores);
  const [notes, setNotes] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_AROMA_CATEGORY_ID);
  const [selectedAromas, setSelectedAromas] = useState<AromaId[]>([]);
  const aromaLabels = useMemo(() => buildAromaLabelIndex(AROMA_CATEGORIES), []);

  const toggleAroma = (id: AromaId) => {
    setSelectedAromas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const parsePercent = (value: string) => {
    if (value.trim() === "") return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const getBlendTotal = (items: BlendComponentInput[]) =>
    items.reduce((sum, item) => sum + clamp(parsePercent(item.percent), 0, 100), 0);

  const normalizeBlendAfterPercentChange = (items: BlendComponentInput[], index: number) => {
    const next = items.map((x) => ({ ...x }));

    if (next.length === 2) {
      const p = clamp(parsePercent(next[index].percent), 0, 100);
      next[index].percent = String(p);
      const otherIndex = index === 0 ? 1 : 0;
      next[otherIndex].percent = String(clamp(100 - p, 0, 100));
      return next;
    }

    const sumOthers = next.reduce((sum, item, i) => {
      if (i === index) return sum;
      return sum + clamp(parsePercent(item.percent), 0, 100);
    }, 0);

    const remaining = clamp(100 - sumOthers, 0, 100);
    const p = clamp(parsePercent(next[index].percent), 0, remaining);
    next[index].percent = next[index].percent.trim() === "" ? "" : String(p);
    return next;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    const hasBlendEntries = blend.some((b) => b.grape.trim() !== "" || b.percent.trim() !== "");
    if (composition === "Kupaza" && hasBlendEntries) {
      const filled = blend.filter((b: BlendComponentInput) => b.grape.trim() !== "");
      if (filled.length < 2) return;
      if (getBlendTotal(filled) > 100) return;
    }

    const newWine: NewWine = {
      name: formData.name.trim(),
    };

    const typeValue = formData.type.trim();
    if (typeValue) newWine.type = typeValue;

    const vintageValue = formData.vintage.trim();
    if (vintageValue) newWine.vintage = vintageValue;

    const regionValue = formData.region.trim();
    if (regionValue) newWine.region = regionValue;

    if (composition === "Cisto" || composition === "Kupaza") {
      newWine.composition = composition;
    }

    const varietyValue = variety.trim();
    if (newWine.composition === "Cisto" && varietyValue) {
      newWine.variety = varietyValue;
    }

    if (newWine.composition === "Kupaza") {
      const components = blend
        .filter((b: BlendComponentInput) => b.grape.trim() !== "")
        .map((b: BlendComponentInput) => ({
          grape: b.grape.trim(),
          percent: clamp(parsePercent(b.percent), 0, 100),
        }));
      if (components.length > 0) {
        newWine.blend = components;
      }
    }

    if (includeGrading) {
      newWine.scores = scores;
      newWine.aromas = selectedAromas;
      newWine.notes = notes;
    }

    onSubmit(newWine);
    setFormData({
      name: "",
      type: "",
      vintage: "",
      region: "",
    });
    setComposition("");
    setVariety("");
    setBlend([
      { grape: "", percent: "" },
      { grape: "", percent: "" },
    ]);
    setIncludeGrading(false);
    setScores(defaultScores);
    setNotes("");
    setSelectedCategory(DEFAULT_AROMA_CATEGORY_ID);
    setSelectedAromas([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-amber-50/95 border-2 border-amber-900/30 max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-purple-900" />
            <DialogTitle>Dodaj Novo Vino</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ime Vina</Label>
            <Input
              id="name"
              placeholder="npr. Château Margaux"
              value={formData.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-white/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tip</Label>
            <Select
              value={formData.type}
              onValueChange={(value: string) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="bg-white/80">
                <SelectValue placeholder="Izaberite tip vina" />
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
            <Label>Sastav</Label>
            <RadioGroup
              value={composition}
              onValueChange={(value: string) => setComposition(value as "" | "Cisto" | "Kupaza")}
              className="grid grid-cols-2 gap-3"
            >
              <Label className="flex items-center gap-2 rounded-md border border-amber-900/20 bg-white/70 px-3 py-2">
                <RadioGroupItem value="Cisto" />
                Čisto
              </Label>
              <Label className="flex items-center gap-2 rounded-md border border-amber-900/20 bg-white/70 px-3 py-2">
                <RadioGroupItem value="Kupaza" />
                Kupaža
              </Label>
            </RadioGroup>
          </div>

          {composition === "Cisto" ? (
            <div className="space-y-2">
              <Label htmlFor="variety">Vrsta vina</Label>
              <Input
                id="variety"
                placeholder="npr. Cabernet Sauvignon"
                value={variety}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setVariety(e.target.value)}
                className="bg-white/80"
              />
            </div>
          ) : composition === "Kupaza" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Kupaža (grožđe i procenat)</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBlend([...blend, { grape: "", percent: "" }])}
                  className="h-9"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj
                </Button>
              </div>

              <div className="space-y-2">
                {blend.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_90px_36px] gap-2">
                    <Input
                      placeholder="npr. Merlot"
                      value={item.grape}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const next = blend.map((x) => ({ ...x }));
                        next[index].grape = e.target.value;
                        setBlend(next);
                      }}
                      className="bg-white/80"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="%"
                      value={item.percent}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const next = blend.map((x) => ({ ...x }));
                        next[index].percent = e.target.value;
                        setBlend(normalizeBlendAfterPercentChange(next, index));
                      }}
                      className="bg-white/80"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (blend.length <= 2) return;
                        const next = blend.filter((_, i) => i !== index);
                        setBlend(next.length === 2 ? normalizeBlendAfterPercentChange(next, 0) : next);
                      }}
                      className="h-9 px-0"
                      disabled={blend.length <= 2}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-600">
                Ukupno: {Math.round(getBlendTotal(blend) * 10) / 10}% (maks 100%)
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="vintage">Godina</Label>
            <Input
              id="vintage"
              type="number"
              placeholder="npr. 2015"
              value={formData.vintage}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, vintage: e.target.value })
              }
              className="bg-white/80"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              placeholder="npr. Bordeaux, Francuska"
              value={formData.region}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, region: e.target.value })
              }
              className="bg-white/80"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border border-amber-900/20 bg-white/60 px-3 py-2">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-amber-950">Oceni odmah</div>
              <div className="text-xs text-slate-600">Dodaj ocene i beleške pri unosu</div>
            </div>
            <Switch checked={includeGrading} onCheckedChange={setIncludeGrading} />
          </div>

          {includeGrading ? (
            <div className="space-y-4 pt-2">
              <h3 className="font-semibold text-amber-950">Ocenjivanje</h3>

              <AromaSelector
                categories={AROMA_CATEGORIES}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedAromas={selectedAromas}
                onToggleAroma={toggleAroma}
                aromaLabels={aromaLabels}
              />

              {(
                [
                  { key: "appearance" as const, label: "Izgled", description: "Bistrina, boja i viskoznost" },
                  { key: "taste" as const, label: "Ukus", description: "Aroma, balans i kompleksnost" },
                  { key: "finish" as const, label: "Završetak", description: "Posleukus i trajanje" },
                  { key: "overall" as const, label: "Ukupno", description: "Opšti utisak" },
                ]
              ).map((category) => (
                <div key={category.key} className="space-y-2">
                  <div>
                    <Label className="text-base">{category.label}</Label>
                    <p className="text-xs text-slate-600">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[scores[category.key]]}
                      onValueChange={(value: number[]) =>
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

              <div className="space-y-2">
                <Label htmlFor="notes">Beleške Degustacije</Label>
                <Textarea
                  id="notes"
                  placeholder="Dodajte vaše beleške ovde..."
                  value={notes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  className="min-h-[100px] bg-white/80"
                />
              </div>
            </div>
          ) : null}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Otkaži
            </Button>
            <Button type="submit" className="flex-1 bg-purple-900 hover:bg-purple-800">
              Dodaj Vino
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}