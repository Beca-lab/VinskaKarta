import { useMemo, useRef, useState, type FormEvent } from "react";
import { Minus, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
  AROMA_CATEGORIES,
  buildAromaLabelIndex,
  DEFAULT_AROMA_CATEGORY_ID,
  type AromaId,
} from "../../data/aromas";
import { AromaCategorySelector } from "./aroma/AromaCategorySelector";
import { AromaChipGrid } from "./aroma/AromaChipGrid";
import { AromaSelector } from "./aroma/AromaSelector";
import { SelectedAromaTags } from "./aroma/SelectedAromaTags";
import { DetailedEvalFields } from "./DetailedEvalFields";
import {
  blendInputsToComponents,
  computeRating,
  createDefaultDetailedEval,
  createEmptyBlend,
  DEFAULT_SCORES,
  formatDecimal,
  formatNumber,
  getBlendTotal,
  normalizeBlendAfterPercentChange,
  parseOptionalNumber,
  SCORE_CATEGORIES,
  todayISO,
  WINE_TYPES,
  type BlendComponentInput,
  type Composition,
  type DetailedEvaluation,
  type GradingScores,
  type NewWine,
  type Wine,
  type WineSuggestions,
} from "../wine";

type FormErrors = Partial<Record<"name" | "blend" | "vintage" | "price" | "alcohol", string>>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p data-error className="text-xs text-red-700">
      {message}
    </p>
  );
}

/** Trenutna ukupna ocena, računa se uživo dok se pomeraju klizači. */
function LiveRating({ scores }: { scores?: GradingScores }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold text-purple-900">
      <Star className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
      {scores ? formatDecimal(computeRating(scores)) : "–"}
    </span>
  );
}

interface WineFormProps {
  /** "add" = novo vino, "edit" = izmena i ocenjivanje postojećeg */
  mode: "add" | "edit";
  /** Vino koje se menja (samo u režimu "edit") */
  initial?: Wine | null;
  /** Ranije unete vrednosti (regioni, sorte...) koje se nude dok korisnik kuca */
  suggestions?: WineSuggestions;
  onSubmit: (values: NewWine) => void;
  onCancel: () => void;
}

/** Lista predloga za tekstualno polje (polje je povezuje preko atributa `list`). */
function Suggestions({ id, values }: { id: string; values?: string[] }) {
  return (
    <datalist id={id}>
      {(values ?? []).map((value) => (
        <option key={value} value={value} />
      ))}
    </datalist>
  );
}

/**
 * Zajednička forma za dodavanje i za izmenu/ocenjivanje vina.
 * Forma se pravi iznova svaki put kad se prozor otvori, pa početno stanje čita iz `initial`.
 */
export function WineForm({ mode, initial, suggestions, onSubmit, onCancel }: WineFormProps) {
  const isEdit = mode === "edit";
  const idPrefix = isEdit ? "edit-" : "";

  // ---- Podaci o vinu ----
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [vintage, setVintage] = useState(initial?.vintage ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [winery, setWinery] = useState(initial?.winery ?? "");
  const [priceText, setPriceText] = useState(initial?.price !== undefined ? formatNumber(initial.price) : "");
  const [alcoholText, setAlcoholText] = useState(
    initial?.alcohol !== undefined ? formatNumber(initial.alcohol) : ""
  );
  const [purchasePlace, setPurchasePlace] = useState(initial?.purchasePlace ?? "");
  const [buyAgain, setBuyAgain] = useState(Boolean(initial?.buyAgain));

  const [composition, setComposition] = useState<"" | Composition>(initial?.composition ?? "");
  const [variety, setVariety] = useState(initial?.variety ?? "");
  const [blend, setBlend] = useState<BlendComponentInput[]>(() =>
    initial?.blend && initial.blend.length > 0
      ? initial.blend.map((b) => ({ grape: b.grape ?? "", percent: String(b.percent ?? "") }))
      : createEmptyBlend()
  );

  // ---- Ocenjivanje ----
  const [includeGrading, setIncludeGrading] = useState(isEdit);
  const [scores, setScores] = useState<GradingScores>(initial?.scores ?? DEFAULT_SCORES);
  // Pri izmeni: vino dobija ocenu tek kad se pomeri neki klizač (inače ostaje neocenjeno)
  const [rated, setRated] = useState(Boolean(initial?.scores));
  const saveScores = isEdit ? rated : includeGrading;
  // Datum degustacije: kad se vino prvi put ocenjuje podrazumeva se današnji;
  // ranije ocenjena vina bez datuma ostaju bez njega dok se ne upiše ručno
  const [tastedAt, setTastedAt] = useState(initial?.tastedAt ?? "");
  const today = useMemo(() => todayISO(), []);
  const shownTastedAt = tastedAt || (saveScores && !initial?.scores ? today : "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const [showAromas, setShowAromas] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_AROMA_CATEGORY_ID);
  const [selectedAromas, setSelectedAromas] = useState<AromaId[]>(initial?.aromas ?? []);
  const aromaLabels = useMemo(() => buildAromaLabelIndex(AROMA_CATEGORIES), []);
  const selectedCategoryData = useMemo(
    () => AROMA_CATEGORIES.find((c) => c.id === selectedCategory),
    [selectedCategory]
  );

  // Detaljna analiza je sklopljena pri otvaranju, ali se već uneta analiza čuva i kad se ne rasklopi
  const [showDetailed, setShowDetailed] = useState(false);
  const [detailedEnabled, setDetailedEnabled] = useState(Boolean(initial?.detailedEval));
  const [detailedEval, setDetailedEval] = useState<DetailedEvaluation>(
    () => initial?.detailedEval ?? createDefaultDetailedEval()
  );

  const setScore = (key: keyof GradingScores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
    setRated(true);
  };

  const toggleAroma = (id: AromaId) => {
    setSelectedAromas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const found: FormErrors = {};
    if (!name.trim()) found.name = "Unesite ime vina.";

    const hasBlendEntries = blend.some((b) => b.grape.trim() !== "" || b.percent.trim() !== "");
    if (composition === "Kupaza" && hasBlendEntries) {
      const filled = blend.filter((b) => b.grape.trim() !== "");
      if (filled.length < 2) {
        found.blend = "Kupaža mora imati bar dve sorte (upišite naziv svake).";
      } else if (getBlendTotal(filled) > 100) {
        found.blend = "Zbir procenata ne sme biti veći od 100%.";
      }
    }

    if (vintage.trim()) {
      const year = Number(vintage);
      const maxYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1900 || year > maxYear) {
        found.vintage = `Godina mora biti ceo broj između 1900 i ${maxYear}.`;
      }
    }

    const price = parseOptionalNumber(priceText);
    if (price !== undefined && (Number.isNaN(price) || price < 0)) {
      found.price = "Cena mora biti broj (npr. 1200 ili 9,50).";
    }

    const alcohol = parseOptionalNumber(alcoholText);
    if (alcohol !== undefined && (Number.isNaN(alcohol) || alcohol < 0 || alcohol > 100)) {
      found.alcohol = "Alkohol mora biti broj između 0 i 100 (npr. 13,5).";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Prikaži prvu grešku (forma je duga, pa greška može biti van ekrana)
      requestAnimationFrame(() => {
        formRef.current?.querySelector("[data-error]")?.scrollIntoView({ block: "center" });
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const compositionValue = composition === "" ? undefined : composition;
    const blendComponents = compositionValue === "Kupaza" ? blendInputsToComponents(blend) : [];

    // Sva polja se navode izričito (i kad su prazna), da izmena može i da obriše staru vrednost
    const values: NewWine = {
      name: name.trim(),
      type: type.trim() || undefined,
      vintage: vintage.trim() || undefined,
      region: region.trim() || undefined,
      composition: compositionValue,
      variety: compositionValue === "Cisto" && variety.trim() ? variety.trim() : undefined,
      blend: blendComponents.length > 0 ? blendComponents : undefined,
      winery: winery.trim() || undefined,
      price: parseOptionalNumber(priceText),
      alcohol: parseOptionalNumber(alcoholText),
      purchasePlace: purchasePlace.trim() || undefined,
      buyAgain: buyAgain || undefined,
      scores: saveScores ? scores : undefined,
      tastedAt: shownTastedAt || undefined,
      aromas: includeGrading ? selectedAromas : undefined,
      notes: includeGrading ? notes : undefined,
      detailedEval: includeGrading && detailedEnabled ? detailedEval : undefined,
    };

    onSubmit(values);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={isEdit ? "space-y-6 py-4" : "space-y-4 py-4"}
    >
      <Suggestions id={`${idPrefix}dl-regions`} values={suggestions?.regions} />
      <Suggestions id={`${idPrefix}dl-varieties`} values={suggestions?.varieties} />
      <Suggestions id={`${idPrefix}dl-wineries`} values={suggestions?.wineries} />
      <Suggestions id={`${idPrefix}dl-places`} values={suggestions?.places} />

      {/* ---------- Podaci o vinu ---------- */}
      <div className={isEdit ? "space-y-4 pb-4 border-b border-amber-900/20" : "space-y-4"}>
        {isEdit ? <h3 className="font-semibold text-amber-950">Informacije o vinu</h3> : null}

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}name`}>Ime vina</Label>
          <Input
            id={`${idPrefix}name`}
            placeholder={isEdit ? undefined : "npr. Cabernet Sauvignon Barrique"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/80"
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError message={errors.name} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}winery`}>Vinarija</Label>
          <Input
            id={`${idPrefix}winery`}
            list={`${idPrefix}dl-wineries`}
            value={winery}
            onChange={(e) => setWinery(e.target.value)}
            className="bg-white/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}type`}>Tip</Label>
          <Select value={type} onValueChange={(value: string) => setType(value)}>
            <SelectTrigger id={`${idPrefix}type`} className="bg-white/80">
              <SelectValue placeholder={isEdit ? undefined : "Izaberite tip vina"} />
            </SelectTrigger>
            <SelectContent>
              {WINE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sastav</Label>
          <RadioGroup
            value={composition}
            onValueChange={(value: string) => setComposition(value as "" | Composition)}
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
            <Label htmlFor={`${idPrefix}variety`}>Vrsta vina</Label>
            <Input
              id={`${idPrefix}variety`}
              placeholder="npr. Cabernet Sauvignon"
              list={`${idPrefix}dl-varieties`}
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
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
                    list={`${idPrefix}dl-varieties`}
                    value={item.grape}
                    onChange={(e) => {
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
                    onChange={(e) => {
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
                    aria-label="Ukloni sortu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-600">
              Ukupno: {String(Math.round(getBlendTotal(blend) * 10) / 10).replace(".", ",")}% (maks 100%)
            </div>
            <FieldError message={errors.blend} />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}vintage`}>Godina</Label>
          <Input
            id={`${idPrefix}vintage`}
            type="number"
            placeholder={isEdit ? undefined : "npr. 2015"}
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            className="bg-white/80"
            min="1900"
            max={new Date().getFullYear()}
            aria-invalid={Boolean(errors.vintage)}
          />
          <FieldError message={errors.vintage} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}region`}>Region</Label>
          <Input
            id={`${idPrefix}region`}
            placeholder={isEdit ? undefined : "npr. Bordeaux, Francuska"}
            list={`${idPrefix}dl-regions`}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-white/80"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}alcohol`}>Alkohol (%)</Label>
            <Input
              id={`${idPrefix}alcohol`}
              inputMode="decimal"
              placeholder="npr. 13,5"
              value={alcoholText}
              onChange={(e) => setAlcoholText(e.target.value)}
              className="bg-white/80"
              aria-invalid={Boolean(errors.alcohol)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}price`}>Cena</Label>
            <Input
              id={`${idPrefix}price`}
              inputMode="decimal"
              placeholder="npr. 1200"
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              className="bg-white/80"
              aria-invalid={Boolean(errors.price)}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <FieldError message={errors.alcohol} />
            <FieldError message={errors.price} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}purchase-place`}>Mesto kupovine</Label>
          <Input
            id={`${idPrefix}purchase-place`}
            placeholder="npr. vinarija, vinoteka, market"
            list={`${idPrefix}dl-places`}
            value={purchasePlace}
            onChange={(e) => setPurchasePlace(e.target.value)}
            className="bg-white/80"
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border border-amber-900/20 bg-white/60 px-3 py-2">
          <Label htmlFor={`${idPrefix}buy-again`} className="text-sm font-medium text-amber-950">
            Kupio bih opet
          </Label>
          <Switch id={`${idPrefix}buy-again`} checked={buyAgain} onCheckedChange={setBuyAgain} />
        </div>
      </div>

      {/* ---------- Ocenjivanje ---------- */}
      {!isEdit ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-amber-900/20 bg-white/60 px-3 py-2">
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-amber-950">Oceni odmah</div>
            <div className="text-xs text-slate-600">Dodaj ocene i beleške pri unosu</div>
          </div>
          <Switch checked={includeGrading} onCheckedChange={setIncludeGrading} />
        </div>
      ) : null}

      {includeGrading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-amber-950">Ocenjivanje</h3>
            <LiveRating scores={saveScores ? scores : undefined} />
          </div>

          {/* Arome */}
          {isEdit ? (
            <AromaSelector
              categories={AROMA_CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedAromas={selectedAromas}
              onToggleAroma={toggleAroma}
              aromaLabels={aromaLabels}
              startMinimized={true}
            />
          ) : (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAromas(!showAromas)}
                className="w-full justify-between"
              >
                <span>Arome {selectedAromas.length > 0 && `(${selectedAromas.length})`}</span>
                <span>{showAromas ? "▼" : "▶"}</span>
              </Button>

              {showAromas && (
                <div className="space-y-3 rounded-md border border-amber-900/20 bg-white/60 p-3">
                  <AromaCategorySelector
                    categories={AROMA_CATEGORIES}
                    selectedCategoryId={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                  <AromaChipGrid
                    category={selectedCategoryData}
                    selectedAromas={selectedAromas}
                    onToggleAroma={toggleAroma}
                  />
                  <div className="pt-1">
                    <SelectedAromaTags
                      selectedAromas={selectedAromas}
                      aromaLabels={aromaLabels}
                      onRemove={toggleAroma}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Klizači */}
          {SCORE_CATEGORIES.map((category) => (
            <div key={category.key} className="space-y-2">
              <div>
                <Label className="text-base">{category.label}</Label>
                <p className="text-xs text-slate-600">{category.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-9 p-0 shrink-0 bg-white/70"
                  aria-label={`${category.label}: smanji za 1`}
                  disabled={scores[category.key] <= 0}
                  onClick={() => setScore(category.key, scores[category.key] - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Slider
                  value={[scores[category.key]]}
                  onValueChange={(value: number[]) => setScore(category.key, value[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-9 p-0 shrink-0 bg-white/70"
                  aria-label={`${category.label}: povećaj za 1`}
                  disabled={scores[category.key] >= 100}
                  onClick={() => setScore(category.key, scores[category.key] + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="text-sm font-semibold min-w-[3ch] text-right">{scores[category.key]}</span>
              </div>
            </div>
          ))}

          {isEdit && rated ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-red-700 hover:bg-red-100 hover:text-red-700"
                onClick={() => {
                  setScores(DEFAULT_SCORES);
                  setRated(false);
                }}
              >
                Ukloni ocenu
              </Button>
            </div>
          ) : null}

          {isEdit && !rated ? (
            <p className="text-xs text-slate-600 rounded-md border border-amber-900/20 bg-white/60 px-3 py-2">
              Vino još nije ocenjeno. Pomerite bar jedan klizač da biste upisali ocenu.
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}tasted-at`}>Datum degustacije</Label>
            <Input
              id={`${idPrefix}tasted-at`}
              type="date"
              value={shownTastedAt}
              max={today}
              onChange={(e) => setTastedAt(e.target.value)}
              className="bg-white/80"
            />
          </div>

          {/* Detaljna analiza */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!showDetailed) setDetailedEnabled(true);
              setShowDetailed(!showDetailed);
            }}
            className="w-full"
          >
            {showDetailed ? "▼ Sakrij detaljnu analizu" : "▶ Prikaži detaljnu analizu"}
            {!showDetailed && detailedEnabled ? " (uneta)" : ""}
          </Button>

          {showDetailed && (
            <div className="space-y-4 pt-2 border-t border-amber-900/20">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-amber-950">Detaljna analiza</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-red-700 hover:bg-red-100 hover:text-red-700"
                  onClick={() => {
                    setDetailedEval(createDefaultDetailedEval());
                    setDetailedEnabled(false);
                    setShowDetailed(false);
                  }}
                >
                  Obriši analizu
                </Button>
              </div>
              <DetailedEvalFields value={detailedEval} onChange={setDetailedEval} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}notes`}>Beleške degustacije</Label>
            <Textarea
              id={`${idPrefix}notes`}
              placeholder="Dodajte vaše beleške ovde..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] bg-white/80"
            />
          </div>
        </div>
      ) : null}

      {includeGrading && saveScores ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-purple-500/40 bg-purple-50 px-3 py-2">
          <span className="text-sm text-purple-900">Ukupna ocena</span>
          <LiveRating scores={scores} />
        </div>
      ) : null}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Otkaži
        </Button>
        <Button type="submit" className="flex-1 bg-purple-900 hover:bg-purple-800">
          {!isEdit ? "Dodaj vino" : rated ? "Potvrdi ocenu" : "Sačuvaj"}
        </Button>
      </div>
    </form>
  );
}
