import type { Wine } from "./wine";

// Čuvanje vina na uređaju + format rezervne kopije.
//
// U localStorage-u lista vina ostaje običan niz pod ključem STORAGE_KEY (isto kao u starijim
// verzijama aplikacije), a verzija formata se čuva odvojeno pod VERSION_KEY.
// Kad se format promeni: povećati DATA_VERSION i dodati korak u MIGRATIONS.

export const STORAGE_KEY = "wine-app-data";
export const VERSION_KEY = "wine-app-data-version";
const CORRUPT_KEY = "wine-app-data-corrupt";

export const DATA_VERSION = 2;

type Migration = (wine: Wine) => Wine;

/** MIGRATIONS[n] prevodi jedno vino iz verzije n u verziju n+1. */
const MIGRATIONS: Record<number, Migration> = {
  // 1 -> 2: uvedena oznaka verzije, sama vina se ne menjaju
  1: (wine) => wine,
};

export const migrateWines = (wines: Wine[], fromVersion: number): Wine[] => {
  let result = wines;
  for (let v = Math.max(1, fromVersion); v < DATA_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (step) result = result.map(step);
  }
  return result;
};

/** Od proizvoljne liste pravi ispravnu listu vina: izbacuje ne-objekte i obezbeđuje jedinstven id. */
export const sanitizeWines = (list: unknown[]): Wine[] => {
  const wines: Wine[] = [];
  const usedIds = new Set<number>();
  let nextId = 1;
  for (const item of list) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const w = item as Partial<Wine>;
    let id = typeof w.id === "number" && Number.isFinite(w.id) ? w.id : NaN;
    if (Number.isNaN(id) || usedIds.has(id)) {
      while (usedIds.has(nextId)) nextId++;
      id = nextId;
    }
    usedIds.add(id);
    wines.push({ ...(w as Wine), id, name: typeof w.name === "string" ? w.name : "" });
  }
  return wines;
};

/**
 * Čita tekst rezervne kopije. Prihvata i novi format ({ version, wines: [...] })
 * i običan niz vina (stari format). Baca Error sa porukom za korisnika.
 */
export const parseWineData = (text: string): Wine[] => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Tekst nije ispravan JSON.");
  }

  let list: unknown[] | null = null;
  let version = 1;
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === "object") {
    const obj = data as { wines?: unknown; version?: unknown };
    if (Array.isArray(obj.wines)) list = obj.wines;
    if (typeof obj.version === "number" && Number.isFinite(obj.version)) version = obj.version;
  }
  if (!list) throw new Error("U rezervnoj kopiji nije pronađena lista vina.");
  if (version > DATA_VERSION) {
    throw new Error("Rezervna kopija je napravljena novijom verzijom aplikacije. Ažurirajte aplikaciju.");
  }

  const wines = sanitizeWines(list);
  if (list.length > 0 && wines.length === 0) {
    throw new Error("Nijedno vino u rezervnoj kopiji nema ispravan format.");
  }
  return migrateWines(wines, version);
};

export const serializeBackup = (wines: Wine[]): string =>
  JSON.stringify(
    { app: "vinska-karta", version: DATA_VERSION, exportedAt: new Date().toISOString(), wines },
    null,
    2
  );

/** Učitava vina sa uređaja. Vraća null ako još ništa nije sačuvano (prvo pokretanje). */
export const loadWines = (): Wine[] | null => {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("Sačuvani podaci nisu lista.");
    const version = Number(localStorage.getItem(VERSION_KEY)) || 1;
    return migrateWines(sanitizeWines(parsed), version);
  } catch (error) {
    console.error("Greška pri učitavanju vina:", error);
    // Oštećene podatke sklanjamo na stranu da ih sledeće čuvanje ne pregazi
    try {
      if (stored) localStorage.setItem(CORRUPT_KEY, stored);
    } catch {
      // nema mesta ili skladište nije dostupno
    }
    return null;
  }
};

export const saveWines = (wines: Wine[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
    localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
  } catch (error) {
    console.error("Greška pri čuvanju vina:", error);
  }
};
