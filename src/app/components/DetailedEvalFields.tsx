import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { DetailedEvaluation } from "../wine";

type Option = { value: string; label: string };

type Field = {
  key: string;
  label: string;
  /** Ponuđene vrednosti; ako ih nema, polje je slobodan tekst. */
  options?: Option[];
  placeholder?: string;
  wide?: boolean;
};

type Section = {
  id: keyof DetailedEvaluation;
  title: string;
  fields: Field[];
};

const opts = (...values: string[]): Option[] => values.map((value) => ({ value, label: value }));
const LEVELS = opts("Nizak", "Srednji", "Visok");
const LENGTHS = opts("Kratka", "Srednja", "Duga");

const SECTIONS: Section[] = [
  {
    id: "appearance",
    title: "Izgled",
    fields: [
      { key: "clarity", label: "Bistrina", options: opts("Bistro", "Slabije", "Mutno") },
      { key: "intensity", label: "Intenzitet", options: LEVELS },
      { key: "viscosity", label: "Viskoznost", options: LENGTHS },
      { key: "color", label: "Boja", placeholder: "npr. rubin" },
    ],
  },
  {
    id: "aroma",
    title: "Miris",
    fields: [
      { key: "condition", label: "Stanje", options: opts("Ispravno", "Neispravno") },
      { key: "intensity", label: "Intenzitet", options: LEVELS },
      { key: "development", label: "Razvoj", options: opts("Mlado", "Zrelo", "Razvijeno"), wide: true },
    ],
  },
  {
    id: "taste",
    title: "Ukus",
    fields: [
      { key: "sweetness", label: "Slatkoća", options: opts("Suvo", "Polusuvo", "Poluslatko", "Slatko") },
      { key: "acidity", label: "Kiselina", options: LEVELS },
      { key: "body", label: "Telo", options: opts("Lagano", "Srednje", "Puno") },
      { key: "tannins", label: "Tanini (za crvena)", options: opts("Nema", "Nizak", "Srednji", "Visok") },
    ],
  },
  {
    id: "conclusion",
    title: "Zaključak",
    fields: [
      {
        key: "quality",
        label: "Kvalitet",
        options: [
          { value: "Sa_manom", label: "Sa manom" },
          ...opts("Slabije", "Prihvatljivo", "Dobro"),
          { value: "Vrlo_dobro", label: "Vrlo dobro" },
          ...opts("Izuzetno"),
        ],
      },
      { key: "finish", label: "Završnica", options: LENGTHS },
      {
        key: "balance",
        label: "Balans",
        options: [
          { value: "Lose", label: "Loše" },
          { value: "Dobro", label: "Dobro" },
          { value: "Odlicno", label: "Odlično" },
        ],
        wide: true,
      },
    ],
  },
];

interface DetailedEvalFieldsProps {
  value: DetailedEvaluation;
  onChange: (value: DetailedEvaluation) => void;
}

/** Polja detaljne analize (izgled, miris, ukus, zaključak). Ne utiču na ocenu. */
export function DetailedEvalFields({ value, onChange }: DetailedEvalFieldsProps) {
  const getValue = (section: Section, field: Field): string =>
    (value[section.id] as Record<string, string | undefined>)[field.key] ?? "";

  const setValue = (section: Section, field: Field, next: string) => {
    onChange({
      ...value,
      [section.id]: { ...value[section.id], [field.key]: next },
    } as DetailedEvaluation);
  };

  return (
    <div className="space-y-4">
      {SECTIONS.map((section) => (
        <div key={section.id} className="space-y-3">
          <h5 className="text-sm font-medium text-purple-900">{section.title}</h5>
          <div className="grid grid-cols-2 gap-2">
            {section.fields.map((field) => (
              <div key={field.key} className={field.wide ? "space-y-1 col-span-2" : "space-y-1"}>
                <Label className="text-xs">{field.label}</Label>
                {field.options ? (
                  <Select value={getValue(section, field)} onValueChange={(v: string) => setValue(section, field, v)}>
                    <SelectTrigger className="bg-white/80 text-xs h-8">
                      <SelectValue placeholder="Izaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={getValue(section, field)}
                    onChange={(e) => setValue(section, field, e.target.value)}
                    placeholder={field.placeholder}
                    className="bg-white/80 text-xs h-8"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
