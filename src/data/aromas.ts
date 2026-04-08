export type AromaId = string;

export interface AromaItem {
  id: AromaId;
  label: string;
}

export interface AromaSubcategory {
  id: string;
  label: string;
  aromas: AromaItem[];
}

export interface AromaCategory {
  id: string;
  label: string;
  subcategories?: AromaSubcategory[];
  aromas?: AromaItem[];
}

export const AROMA_CATEGORIES: AromaCategory[] = [
  {
    id: "fruity",
    label: "Voćni",
    subcategories: [
      {
        id: "citrus",
        label: "Citrus",
        aromas: [
          { id: "lemon", label: "Limun" },
          { id: "grapefruit", label: "Grejpfrut" },
          { id: "lime", label: "Limeta" },
          { id: "orange", label: "Narandža" },
        ],
      },
      {
        id: "berries",
        label: "Bobice",
        aromas: [
          { id: "strawberry", label: "Jagoda" },
          { id: "blackberry", label: "Kupina" },
          { id: "raspberry", label: "Malina" },
          { id: "blueberry", label: "Borovnica" },
          { id: "blackcurrant", label: "Crna ribizla" },
        ],
      },
      {
        id: "tropical",
        label: "Tropski",
        aromas: [
          { id: "pineapple", label: "Ananas" },
          { id: "mango", label: "Mango" },
          { id: "passion_fruit", label: "Marakuja" },
          { id: "banana", label: "Banana" },
          { id: "coconut", label: "Kokos" },
        ],
      },
      {
        id: "stone_fruits",
        label: "Koštunavo voće",
        aromas: [
          { id: "peach", label: "Breskva" },
          { id: "apricot", label: "Kajsija" },
          { id: "cherry", label: "Trešnja" },
          { id: "plum", label: "Šljiva" },
        ],
      },
      {
        id: "pome_fruits",
        label: "Jabučasto voće",
        aromas: [
          { id: "apple", label: "Jabuka" },
          { id: "pear", label: "Kruška" },
          { id: "quince", label: "Dunja" },
        ],
      },
    ],
  },
  {
    id: "floral",
    label: "Cvetni",
    aromas: [
      { id: "rose", label: "Ruža" },
      { id: "lavender", label: "Lavanda" },
      { id: "apple_blossom", label: "Cvet jabuke" },
      { id: "cherry_blossom", label: "Cvet trešnje" },
      { id: "acacia", label: "Bagrem" },
      { id: "jasmine", label: "Jasmin" },
      { id: "orange_blossom", label: "Cvet narandže" },
      { id: "violet", label: "Ljubičica" },
      { id: "linden", label: "Lipa" },
    ],
  },
  {
    id: "spicy",
    label: "Začinski",
    aromas: [
      { id: "pepper", label: "Biber" },
      { id: "vanilla", label: "Vanila" },
      { id: "cinnamon", label: "Cimet" },
      { id: "clove", label: "Klinčić" },
      { id: "nutmeg", label: "Muskatni oraščić" },
      { id: "anise", label: "Anis" },
      { id: "ginger", label: "Đumbir" },
      { id: "licorice", label: "Sladić" },
    ],
  },
  {
    id: "herbal",
    label: "Biljni",
    aromas: [
      { id: "mint", label: "Nana" },
      { id: "sage", label: "Žalfija" },
      { id: "thyme", label: "Majčina dušica" },
      { id: "rosemary", label: "Ruzmarin" },
      { id: "basil", label: "Bosiljak" },
      { id: "eucalyptus", label: "Eukaliptus" },
      { id: "hay", label: "Seno" },
      { id: "tea", label: "Čaj" },
    ],
  },
  {
    id: "earthy",
    label: "Zemljišni",
    aromas: [
      { id: "mushroom", label: "Pečurka" },
      { id: "truffle", label: "Tartuf" },
      { id: "wet_soil", label: "Vlažna zemlja" },
      { id: "forest_floor", label: "Šumsko dno" },
      { id: "clay", label: "Glina" },
      { id: "slate", label: "Škriljac" },
      { id: "petrichor", label: "Mir kiše" },
    ],
  },
  {
    id: "woody",
    label: "Drveni",
    aromas: [
      { id: "oak", label: "Hrast" },
      { id: "cedar", label: "Kedar" },
      { id: "pine", label: "Bor" },
      { id: "smoke", label: "Dim" },
      { id: "tobacco", label: "Duvan" },
      { id: "leather", label: "Koža" },
      { id: "coffee", label: "Kafa" },
      { id: "chocolate", label: "Čokolada" },
    ],
  },
  {
    id: "mineral",
    label: "Mineralni",
    aromas: [
      { id: "flint", label: "Kremen" },
      { id: "chalk", label: "Kreda" },
      { id: "wet_stone", label: "Vlažan kamen" },
      { id: "iodine", label: "Jodin" },
      { id: "sea_breeze", label: "Morski povetarac" },
      { id: "salt", label: "So" },
    ],
  },
  {
    id: "chemical",
    label: "Hemijski",
    aromas: [
      { id: "petrol", label: "Benzin" },
      { id: "kerosene", label: "Kerozin" },
      { id: "rubber", label: "Guma" },
      { id: "sulfur", label: "Sumpor" },
      { id: "acetone", label: "Aceton" },
      { id: "vinegar", label: "Sirće" },
    ],
  },
  {
    id: "baked",
    label: "Pečeni",
    aromas: [
      { id: "bread", label: "Hleb" },
      { id: "toast", label: "Tost" },
      { id: "caramel", label: "Karamel" },
      { id: "honey", label: "Med" },
      { id: "butter", label: "Puter" },
      { id: "biscuit", label: "Keks" },
      { id: "pastry", label: "Testo" },
    ],
  },
  {
    id: "dried_fruits",
    label: "Sušeno voće",
    aromas: [
      { id: "raisin", label: "Grožđica" },
      { id: "prune", label: "Suve šljive" },
      { id: "fig", label: "Smokva" },
      { id: "date", label: "Datula" },
      { id: "dried_apricot", label: "Suve kajsije" },
    ],
  },
];

export const DEFAULT_AROMA_CATEGORY_ID = "all";

export const buildAromaLabelIndex = (categories: AromaCategory[]) => {
  const map: Record<AromaId, string> = {};

  for (const category of categories) {
    if (category.aromas) {
      for (const aroma of category.aromas) {
        map[aroma.id] = aroma.label;
      }
    }

    if (category.subcategories) {
      for (const sub of category.subcategories) {
        for (const aroma of sub.aromas) {
          map[aroma.id] = aroma.label;
        }
      }
    }
  }

  return map;
};
