import type { Wine } from "./wine";

// Računanje statistike za stranicu "Statistika" (bez React-a, da može lako da se testira).

export interface GroupStat {
  label: string;
  /** Broj vina u grupi */
  count: number;
  /** Broj ocenjenih vina u grupi */
  rated: number;
  /** Prosečna ocena ocenjenih vina; undefined ako nijedno nije ocenjeno */
  average?: number;
}

const averageOf = (values: number[]): number | undefined =>
  values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : undefined;

/** Grupiše vina po nekoj osobini (tip, region...) i računa prosek po grupi. Najbolje ocenjene grupe prvo. */
export const groupStats = (wines: Wine[], keyOf: (wine: Wine) => string | undefined): GroupStat[] => {
  const groups = new Map<string, Wine[]>();
  for (const wine of wines) {
    const key = keyOf(wine)?.trim();
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), wine]);
  }
  return Array.from(groups.entries())
    .map(([label, items]) => {
      const ratings = items.map((w) => w.rating).filter((r): r is number => r !== undefined);
      return { label, count: items.length, rated: ratings.length, average: averageOf(ratings) };
    })
    .sort(
      (a, b) =>
        (b.average ?? -1) - (a.average ?? -1) || b.count - a.count || a.label.localeCompare(b.label, "sr")
    );
};

export interface CountStat {
  label: string;
  count: number;
}

/** Najčešće izabrane arome (id arome -> broj vina). */
export const aromaCounts = (wines: Wine[], aromaLabels: Record<string, string>, limit = 10): CountStat[] => {
  const counts = new Map<string, number>();
  for (const wine of wines) {
    for (const id of new Set(wine.aromas ?? [])) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([id, count]) => ({ label: aromaLabels[id] || id, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "sr"))
    .slice(0, limit);
};

/** Najbolje ocenjena vina. */
export const topWines = (wines: Wine[], limit = 5): Wine[] =>
  wines
    .filter((w) => w.rating !== undefined)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.id - a.id)
    .slice(0, limit);

const BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: "ispod 50", min: -Infinity, max: 50 },
  { label: "50–59", min: 50, max: 60 },
  { label: "60–69", min: 60, max: 70 },
  { label: "70–79", min: 70, max: 80 },
  { label: "80–89", min: 80, max: 90 },
  { label: "90–100", min: 90, max: Infinity },
];

/** Raspodela ocena po rasponima (koliko vina ima ocenu 50–59, 60–69...). */
export const ratingDistribution = (wines: Wine[]): CountStat[] =>
  BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: wines.filter((w) => w.rating !== undefined && w.rating >= bucket.min && w.rating < bucket.max).length,
  }));
