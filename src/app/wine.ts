import type { AromaId } from "../data/aromas";

// Zajednički tipovi i pomoćne funkcije za vina (koriste ih App, GradingModal i AddWineModal)

export interface GradingScores {
  appearance: number;
  taste: number;
  finish: number;
  overall: number;
}

export interface DetailedEvaluation {
  // IZGLED
  appearance: {
    clarity: 'Bistro' | 'Slabije' | 'Mutno';
    color: string;
    intensity: 'Nizak' | 'Srednji' | 'Visok';
    viscosity: 'Kratka' | 'Srednja' | 'Duga';
  };
  // MIRIS
  aroma: {
    condition: 'Ispravno' | 'Neispravno';
    intensity: 'Nizak' | 'Srednji' | 'Visok';
    development: 'Mlado' | 'Zrelo' | 'Razvijeno';
  };
  // UKUS
  taste: {
    sweetness: 'Suvo' | 'Polusuvo' | 'Poluslatko' | 'Slatko';
    acidity: 'Nizak' | 'Srednji' | 'Visok';
    tannins?: 'Nema' | 'Nizak' | 'Srednji' | 'Visok';
    body: 'Lagano' | 'Srednje' | 'Puno';
  };
  // ZAKLJUČAK
  conclusion: {
    quality: 'Sa_manom' | 'Slabije' | 'Prihvatljivo' | 'Dobro' | 'Vrlo_dobro' | 'Izuzetno';
    finish: 'Kratka' | 'Srednja' | 'Duga';
    balance: 'Lose' | 'Dobro' | 'Odlicno';
  };
}

export type Composition = "Cisto" | "Kupaza";
export type BlendComponent = { grape: string; percent: number };

export interface Wine {
  id: number;
  name: string;
  type?: string;
  vintage?: string;
  region?: string;
  composition?: Composition;
  variety?: string;
  blend?: BlendComponent[];
  scores?: GradingScores;
  aromas?: AromaId[];
  rating?: number;
  notes?: string;
  detailedEval?: DetailedEvaluation;
}

export type NewWine = Omit<Wine, "id" | "rating">;

export const WINE_TYPES = [
  "Crveno Vino",
  "Belo Vino",
  "Roze Vino",
  "Šampanjac",
  "Penušavo Vino",
  "Desertno Vino",
] as const;

export const SCORE_CATEGORIES: Array<{ key: keyof GradingScores; label: string; description: string }> = [
  { key: "appearance", label: "Izgled", description: "Bistrina, boja i viskoznost" },
  { key: "taste", label: "Ukus", description: "Aroma, balans i kompleksnost" },
  { key: "finish", label: "Završetak", description: "Posleukus i trajanje" },
  { key: "overall", label: "Ukupno", description: "Opšti utisak" },
];

export const DEFAULT_SCORES: GradingScores = {
  appearance: 50,
  taste: 50,
  finish: 50,
  overall: 50,
};

export const createDefaultDetailedEval = (): DetailedEvaluation => ({
  appearance: { clarity: 'Bistro', color: '', intensity: 'Srednji', viscosity: 'Srednja' },
  aroma: { condition: 'Ispravno', intensity: 'Srednji', development: 'Zrelo' },
  taste: { sweetness: 'Suvo', acidity: 'Srednji', body: 'Srednje' },
  conclusion: { quality: 'Dobro', finish: 'Srednja', balance: 'Dobro' },
});

/** Ukupna ocena = prosek 4 kategorije. Izabrane arome ne utiču na ocenu. */
export const computeRating = (scores: GradingScores): number =>
  (scores.appearance + scores.taste + scores.finish + scores.overall) / 4;

// ---- Kupaža (procenti sorti) ----

export type BlendComponentInput = {
  grape: string;
  percent: string;
};

export const createEmptyBlend = (): BlendComponentInput[] => [
  { grape: "", percent: "" },
  { grape: "", percent: "" },
];

export const parsePercent = (value: string) => {
  if (value.trim() === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export const getBlendTotal = (items: BlendComponentInput[]) =>
  items.reduce((sum, item) => sum + clamp(parsePercent(item.percent), 0, 100), 0);

export const normalizeBlendAfterPercentChange = (items: BlendComponentInput[], index: number) => {
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

/** Pretvara unos sa forme u sačuvane komponente kupaže (prazna imena se izbacuju). */
export const blendInputsToComponents = (items: BlendComponentInput[]): BlendComponent[] =>
  items
    .filter((b) => b.grape.trim() !== "")
    .map((b) => ({
      grape: b.grape.trim(),
      percent: clamp(parsePercent(b.percent), 0, 100),
    }));
