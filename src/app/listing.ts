import type { Wine } from "./wine";

// Pretraga, filtriranje i sortiranje liste vina (bez React-a, da može lako da se testira).

export type SortOrder = "newest" | "best" | "worst" | "name" | "vintage" | "tasted";
export type RatedFilter = "all" | "rated" | "unrated";

export interface ListOptions {
  /** Tekst pretrage (ime, vinarija, region, sorta...) */
  search: string;
  /** Tačan tip vina ili "all" */
  type: string;
  /** Tačan region ili "all" */
  region: string;
  /** Id arome ili "all" */
  aroma: string;
  rated: RatedFilter;
  sort: SortOrder;
}

export const DEFAULT_LIST_OPTIONS: ListOptions = {
  search: "",
  type: "all",
  region: "all",
  aroma: "all",
  rated: "all",
  sort: "newest",
};

/** Mala slova bez kvačica, da "sardone" pronađe "Šardone". */
export const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export const matchesSearch = (wine: Wine, query: string): boolean => {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeText(
    [
      wine.name,
      wine.winery,
      wine.region,
      wine.type,
      wine.vintage,
      wine.variety,
      ...(wine.blend ?? []).map((b) => b.grape),
      wine.purchasePlace,
      wine.notes,
    ]
      .filter(Boolean)
      .join(" ")
  );
  return words.every((word) => haystack.includes(word));
};

/** Novija vina prvo: po datumu dodavanja, a starija vina (bez datuma) po rednom broju. */
const compareNewest = (a: Wine, b: Wine): number => {
  if (a.createdAt && b.createdAt && a.createdAt !== b.createdAt) {
    return a.createdAt < b.createdAt ? 1 : -1;
  }
  if (a.createdAt && !b.createdAt) return -1;
  if (!a.createdAt && b.createdAt) return 1;
  return b.id - a.id;
};

/** Poredi po vrednosti koja može da nedostaje; vina bez vrednosti idu na kraj. */
const compareOptional = <T>(a: T | undefined, b: T | undefined, compare: (x: T, y: T) => number): number => {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return compare(a, b);
};

const vintageOf = (wine: Wine): number | undefined => {
  const year = Number(wine.vintage);
  return wine.vintage && Number.isFinite(year) ? year : undefined;
};

const COMPARATORS: Record<SortOrder, (a: Wine, b: Wine) => number> = {
  newest: compareNewest,
  best: (a, b) => compareOptional(a.rating, b.rating, (x, y) => y - x),
  worst: (a, b) => compareOptional(a.rating, b.rating, (x, y) => x - y),
  name: (a, b) => a.name.localeCompare(b.name, "sr", { sensitivity: "base" }),
  vintage: (a, b) => compareOptional(vintageOf(a), vintageOf(b), (x, y) => y - x),
  tasted: (a, b) => compareOptional(a.tastedAt || undefined, b.tastedAt || undefined, (x, y) => (x < y ? 1 : x > y ? -1 : 0)),
};

export const filterAndSortWines = (wines: Wine[], options: ListOptions): Wine[] => {
  const compare = COMPARATORS[options.sort] ?? compareNewest;
  return wines
    .filter((wine) => {
      if (options.type !== "all" && wine.type !== options.type) return false;
      if (options.region !== "all" && wine.region !== options.region) return false;
      if (options.aroma !== "all" && !(wine.aromas ?? []).includes(options.aroma)) return false;
      if (options.rated === "rated" && wine.rating === undefined) return false;
      if (options.rated === "unrated" && wine.rating !== undefined) return false;
      return matchesSearch(wine, options.search);
    })
    .sort((a, b) => compare(a, b) || compareNewest(a, b));
};

export interface WineStats {
  total: number;
  rated: number;
  /** Prosečna ocena ocenjenih vina; undefined ako nijedno nije ocenjeno */
  average?: number;
}

export const computeStats = (wines: Wine[]): WineStats => {
  const ratings = wines.map((w) => w.rating).filter((r): r is number => r !== undefined);
  return {
    total: wines.length,
    rated: ratings.length,
    average: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : undefined,
  };
};
