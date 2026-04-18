import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Wine } from "lucide-react";
import {
  AROMA_CATEGORIES,
  buildAromaLabelIndex,
  DEFAULT_AROMA_CATEGORY_ID,
  type AromaId,
} from "../../data/aromas";
import { AromaSelector } from "./aroma/AromaSelector";

interface Wine {
  id: number;
  name: string;
  type?: string;
  vintage?: string;
  region?: string;
  composition?: "Cisto" | "Kupaza";
  variety?: string;
  blend?: Array<{ grape: string; percent: number }>;
  scores?: GradingScores;
  aromas?: AromaId[];
  notes?: string;
  detailedEval?: DetailedEvaluation;
}

type BlendComponentInput = {
  grape: string;
  percent: string;
};

interface GradingModalProps {
  wine: Wine | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (wineId: number, scores: GradingScores, notes: string, updatedWineInfo: Partial<Wine>, detailedEval?: DetailedEvaluation) => void;
}

export interface GradingScores {
  appearance: number;
  taste: number;
  finish: number;
  overall: number;
}

export interface DetailedEvaluation {
  // IZGLED
  appearance: {
    clarity: 'bistro' | 'slabiji' | 'mutno';
    color: string;
    intensity: 'nizak' | 'srednji' | 'visok';
    viscosity: 'kratka' | 'srednja' | 'duga';
  };
  // MIRIS
  aroma: {
    condition: 'ispravno' | 'lago_smanjen' | 'nepravilno';
    intensity: 'nizak' | 'srednji' | 'visok';
    development: 'mlado' | 'zrelo' | 'razvijeno';
  };
  // UKUS
  taste: {
    sweetness: 'suvo' | 'polusuvo' | 'poluslatko' | 'slatko';
    acidity: 'nizak' | 'srednji' | 'visok';
    tannins?: 'nema' | 'nizak' | 'srednji' | 'visok';
    body: 'lagano' | 'srednje' | 'puno';
  };
  // ZAKLJUČAK
  conclusion: {
    quality: 'sa_manom' | 'slabije' | 'prihvatljivo' | 'dobro' | 'vrlo_dobro' | 'izuzetno';
    finish: 'kratka' | 'srednja' | 'duga';
    balance: 'lose' | 'dobro' | 'odlicno';
  };
}

export function GradingModal({ wine, open, onClose, onSubmit }: GradingModalProps) {
  const defaultScores: GradingScores = {
    appearance: 50,
    taste: 50,
    finish: 50,
    overall: 50,
  };

  const [composition, setComposition] = useState<"" | "Cisto" | "Kupaza">("");
  const [variety, setVariety] = useState("");
  const [blend, setBlend] = useState<BlendComponentInput[]>([
    { grape: "", percent: "" },
    { grape: "", percent: "" },
  ]);

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

  const [scores, setScores] = useState<GradingScores>({
    appearance: 50,
    taste: 50,
    finish: 50,
    overall: 50,
  });

  const [showDetailed, setShowDetailed] = useState(false);
  const [detailedEval, setDetailedEval] = useState<DetailedEvaluation>({
    appearance: { clarity: 'bistro', color: '', intensity: 'srednji', viscosity: 'srednja' },
    aroma: { condition: 'ispravno', intensity: 'srednji', development: 'zrelo' },
    taste: { sweetness: 'suvo', acidity: 'srednji', body: 'srednje' },
    conclusion: { quality: 'dobro', finish: 'srednja', balance: 'dobro' },
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_AROMA_CATEGORY_ID);
  const [selectedAromas, setSelectedAromas] = useState<AromaId[]>([]);
  const aromaLabels = useMemo(() => buildAromaLabelIndex(AROMA_CATEGORIES), []);

  const [notes, setNotes] = useState("");

  const [wineInfo, setWineInfo] = useState({
    name: "",
    type: "",
    vintage: "",
    region: "",
  });

  useEffect(() => {
    if (!wine) return;

    setWineInfo({
      name: wine.name,
      type: wine.type ?? "",
      vintage: wine.vintage ?? "",
      region: wine.region ?? "",
    });
    setScores(wine.scores ?? defaultScores);
    setNotes(wine.notes ?? "");

    setSelectedCategory(DEFAULT_AROMA_CATEGORY_ID);
    setSelectedAromas(wine.aromas ?? []);

    setComposition(wine.composition ?? "");
    setVariety(wine.variety ?? "");
    if (wine.blend && wine.blend.length > 0) {
      setBlend(wine.blend.map((b) => ({ grape: b.grape ?? "", percent: String(b.percent ?? "") })));
    } else {
      setBlend([
        { grape: "", percent: "" },
        { grape: "", percent: "" },
      ]);
    }

    // Always start with collapsed sections - regardless of previous state
    setShowDetailed(false);

    // Load detailed evaluation data if it exists (but keep UI collapsed)
    if (wine.detailedEval) {
      setDetailedEval(wine.detailedEval);
    } else {
      setDetailedEval({
        appearance: { clarity: 'bistro', color: '', intensity: 'srednji', viscosity: 'srednja' },
        aroma: { condition: 'ispravno', intensity: 'srednji', development: 'zrelo' },
        taste: { sweetness: 'suvo', acidity: 'srednji', body: 'srednje' },
        conclusion: { quality: 'dobro', finish: 'srednja', balance: 'dobro' },
      });
    }
  }, [wine?.id, open]);

  const toggleAroma = (id: AromaId) => {
    setSelectedAromas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (wine) {
      const compositionValue = composition === "" ? undefined : composition;
      const updated: Partial<Wine> = {
        name: wineInfo.name,
        type: wineInfo.type.trim() ? wineInfo.type : undefined,
        vintage: wineInfo.vintage.trim() ? wineInfo.vintage : undefined,
        region: wineInfo.region.trim() ? wineInfo.region : undefined,
        composition: compositionValue,
        variety: compositionValue === "Cisto" && variety.trim() ? variety.trim() : undefined,
        blend:
          compositionValue === "Kupaza"
            ? blend
                .filter((b) => b.grape.trim() !== "")
                .map((b) => ({
                  grape: b.grape.trim(),
                  percent: clamp(parsePercent(b.percent), 0, 100),
                }))
            : undefined,
        aromas: selectedAromas,
      };

      onSubmit(wine.id, scores, notes, updated, showDetailed ? detailedEval : undefined);
      onClose();
    }
  };

  const categories = [
    { key: "appearance" as keyof GradingScores, label: "Izgled", description: "Bistrina, boja i viskoznost" },
    { key: "taste" as keyof GradingScores, label: "Ukus", description: "Aroma, balans i kompleksnost" },
    { key: "finish" as keyof GradingScores, label: "Završetak", description: "Posleukus i trajanje" },
    { key: "overall" as keyof GradingScores, label: "Ukupno", description: "Opšti utisak" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-amber-50/95 border-2 border-amber-900/30 max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setWineInfo({ ...wineInfo, name: e.target.value })
                }
                className="bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Tip</Label>
              <Select
                value={wineInfo.type}
                onValueChange={(value: string) => setWineInfo({ ...wineInfo, type: value })}
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
              <Label>Sastav</Label>
              <RadioGroup
                value={composition}
                onValueChange={(value: string) => setComposition(value as "" | "Cisto" | "Kupaza")}
                className="grid grid-cols-1 gap-2"
              >
                <Label className="flex items-center gap-2 rounded-md border border-amber-900/20 bg-white/70 px-3 py-2">
                  <RadioGroupItem value="" />
                  Nije odabrano
                </Label>
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
                <Label htmlFor="edit-variety">Vrsta vina</Label>
                <Input
                  id="edit-variety"
                  placeholder="npr. Cabernet Sauvignon"
                  value={variety}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setVariety(e.target.value)}
                  className="bg-white/80"
                />
              </div>
            ) : composition === "Kupaza" ? (
              <div className="space-y-3">
                <Label>Kupaža (grožđe i procenat)</Label>

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
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    Ukupno: {Math.round(getBlendTotal(blend) * 10) / 10}% (maks 100%)
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBlend([...blend, { grape: "", percent: "" }])}
                    className="h-9"
                  >
                    Dodaj
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="edit-vintage">Godina</Label>
              <Input
                id="edit-vintage"
                type="number"
                value={wineInfo.vintage}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setWineInfo({ ...wineInfo, vintage: e.target.value })
                }
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setWineInfo({ ...wineInfo, region: e.target.value })
                }
                className="bg-white/80"
              />
            </div>
          </div>

          {/* Grading Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-amber-950">Ocenjivanje</h3>

            {/* Arome - always visible but starts minimized */}
            <AromaSelector
              categories={AROMA_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedAromas={selectedAromas}
              onToggleAroma={toggleAroma}
              aromaLabels={aromaLabels}
              startMinimized={true}
            />

            {categories.map((category) => (
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

            {/* Toggle for Detailed Analysis */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDetailed(!showDetailed)}
              className="w-full"
            >
              {showDetailed ? '▼ Sakrij Detaljnu Analizu' : '▶ Prikaži Detaljnu Analizu'}
            </Button>

            {/* Detailed Analysis Section */}
            {showDetailed && (
              <div className="space-y-4 pt-2 border-t border-amber-900/20">
                <h4 className="font-medium text-amber-950">Detaljna Analiza</h4>

                {/* IZGLED */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-purple-900">Izgled</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Bistrina</Label>
                      <Select
                        value={detailedEval.appearance.clarity}
                        onValueChange={(v) => setDetailedEval({...detailedEval, appearance: {...detailedEval.appearance, clarity: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bistro">Bistro</SelectItem>
                          <SelectItem value="slabiji">Slabiji</SelectItem>
                          <SelectItem value="mutno">Mutno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Intenzitet</Label>
                      <Select
                        value={detailedEval.appearance.intensity}
                        onValueChange={(v) => setDetailedEval({...detailedEval, appearance: {...detailedEval.appearance, intensity: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nizak">Nizak</SelectItem>
                          <SelectItem value="srednji">Srednji</SelectItem>
                          <SelectItem value="visok">Visok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Viskoznost</Label>
                      <Select
                        value={detailedEval.appearance.viscosity}
                        onValueChange={(v) => setDetailedEval({...detailedEval, appearance: {...detailedEval.appearance, viscosity: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kratka">Kratka</SelectItem>
                          <SelectItem value="srednja">Srednja</SelectItem>
                          <SelectItem value="duga">Duga</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Boja</Label>
                      <Input
                        value={detailedEval.appearance.color}
                        onChange={(e) => setDetailedEval({...detailedEval, appearance: {...detailedEval.appearance, color: e.target.value}})}
                        placeholder="npr. rubin"
                        className="bg-white/80 text-xs h-8"
                      />
                    </div>
                  </div>
                </div>

                {/* MIRIS */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-purple-900">Miris</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Stanje</Label>
                      <Select
                        value={detailedEval.aroma.condition}
                        onValueChange={(v) => setDetailedEval({...detailedEval, aroma: {...detailedEval.aroma, condition: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ispravno">Ispravno</SelectItem>
                          <SelectItem value="lago_smanjen">Lago smanjen</SelectItem>
                          <SelectItem value="nepravilno">Nepravilno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Intenzitet</Label>
                      <Select
                        value={detailedEval.aroma.intensity}
                        onValueChange={(v) => setDetailedEval({...detailedEval, aroma: {...detailedEval.aroma, intensity: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nizak">Nizak</SelectItem>
                          <SelectItem value="srednji">Srednji</SelectItem>
                          <SelectItem value="visok">Visok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Razvoj</Label>
                      <Select
                        value={detailedEval.aroma.development}
                        onValueChange={(v) => setDetailedEval({...detailedEval, aroma: {...detailedEval.aroma, development: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mlado">Mlado</SelectItem>
                          <SelectItem value="zrelo">Zrelo</SelectItem>
                          <SelectItem value="razvijeno">Razvijeno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* UKUS */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-purple-900">Ukus</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Slatkoća</Label>
                      <Select
                        value={detailedEval.taste.sweetness}
                        onValueChange={(v) => setDetailedEval({...detailedEval, taste: {...detailedEval.taste, sweetness: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="suvo">Suvo</SelectItem>
                          <SelectItem value="polusuvo">Polusuvo</SelectItem>
                          <SelectItem value="poluslatko">Poluslatko</SelectItem>
                          <SelectItem value="slatko">Slatko</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Kiselina</Label>
                      <Select
                        value={detailedEval.taste.acidity}
                        onValueChange={(v) => setDetailedEval({...detailedEval, taste: {...detailedEval.taste, acidity: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nizak">Nizak</SelectItem>
                          <SelectItem value="srednji">Srednji</SelectItem>
                          <SelectItem value="visok">Visok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Telо</Label>
                      <Select
                        value={detailedEval.taste.body}
                        onValueChange={(v) => setDetailedEval({...detailedEval, taste: {...detailedEval.taste, body: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lagano">Lagano</SelectItem>
                          <SelectItem value="srednje">Srednje</SelectItem>
                          <SelectItem value="puno">Puno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tanini (za crvena)</Label>
                      <Select
                        value={detailedEval.taste.tannins || 'nema'}
                        onValueChange={(v) => setDetailedEval({...detailedEval, taste: {...detailedEval.taste, tannins: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nema">Nema</SelectItem>
                          <SelectItem value="nizak">Nizak</SelectItem>
                          <SelectItem value="srednji">Srednji</SelectItem>
                          <SelectItem value="visok">Visok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* ZAKLJUČAK */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-purple-900">Zaključak</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Kvalitet</Label>
                      <Select
                        value={detailedEval.conclusion.quality}
                        onValueChange={(v) => setDetailedEval({...detailedEval, conclusion: {...detailedEval.conclusion, quality: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sa_manom">Sa manom</SelectItem>
                          <SelectItem value="slabije">Slabije</SelectItem>
                          <SelectItem value="prihvatljivo">Prihvatljivo</SelectItem>
                          <SelectItem value="dobro">Dobro</SelectItem>
                          <SelectItem value="vrlo_dobro">Vrlo dobro</SelectItem>
                          <SelectItem value="izuzetno">Izuzetno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Završnica</Label>
                      <Select
                        value={detailedEval.conclusion.finish}
                        onValueChange={(v) => setDetailedEval({...detailedEval, conclusion: {...detailedEval.conclusion, finish: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kratka">Kratka</SelectItem>
                          <SelectItem value="srednja">Srednja</SelectItem>
                          <SelectItem value="duga">Duga</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Balans</Label>
                      <Select
                        value={detailedEval.conclusion.balance}
                        onValueChange={(v) => setDetailedEval({...detailedEval, conclusion: {...detailedEval.conclusion, balance: v as any}})}
                      >
                        <SelectTrigger className="bg-white/80 text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lose">Loše</SelectItem>
                          <SelectItem value="dobro">Dobro</SelectItem>
                          <SelectItem value="odlicno">Odlično</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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