import { formatDate, formatNumber, type Wine } from "./wine";

// Izvoz liste vina u CSV koji Excel otvara direktno
// (tačka-zarez kao separator i decimalni zarez, kako Excel očekuje na srpskom sistemu).

const SEPARATOR = ";";

const escapeCell = (value: string): string =>
  /[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

const num = (value: number | undefined): string => (value === undefined ? "" : formatNumber(value));

const COLUMNS: Array<{ header: string; value: (wine: Wine, aromaLabels: Record<string, string>) => string }> = [
  { header: "Ime", value: (w) => w.name },
  { header: "Vinarija", value: (w) => w.winery ?? "" },
  { header: "Tip", value: (w) => w.type ?? "" },
  { header: "Godina", value: (w) => w.vintage ?? "" },
  { header: "Region", value: (w) => w.region ?? "" },
  {
    header: "Sastav",
    value: (w) => (w.composition === "Cisto" ? "Čisto" : w.composition === "Kupaza" ? "Kupaža" : ""),
  },
  {
    header: "Sorte",
    value: (w) =>
      w.composition === "Kupaza"
        ? (w.blend ?? []).map((b) => `${b.grape} ${formatNumber(b.percent)}%`).join(", ")
        : (w.variety ?? ""),
  },
  { header: "Alkohol (%)", value: (w) => num(w.alcohol) },
  { header: "Cena", value: (w) => num(w.price) },
  { header: "Mesto kupovine", value: (w) => w.purchasePlace ?? "" },
  { header: "Kupio bih opet", value: (w) => (w.buyAgain ? "da" : "") },
  { header: "Ocena", value: (w) => num(w.rating) },
  { header: "Izgled", value: (w) => num(w.scores?.appearance) },
  { header: "Ukus", value: (w) => num(w.scores?.taste) },
  { header: "Završetak", value: (w) => num(w.scores?.finish) },
  { header: "Ukupno", value: (w) => num(w.scores?.overall) },
  { header: "Datum degustacije", value: (w) => formatDate(w.tastedAt) },
  { header: "Arome", value: (w, labels) => (w.aromas ?? []).map((id) => labels[id] || id).join(", ") },
  { header: "Beleške", value: (w) => w.notes ?? "" },
  { header: "Dodato", value: (w) => formatDate(w.createdAt) },
];

export const winesToCsv = (wines: Wine[], aromaLabels: Record<string, string>): string => {
  const rows = [
    COLUMNS.map((column) => column.header),
    ...wines.map((wine) => COLUMNS.map((column) => column.value(wine, aromaLabels))),
  ];
  // BOM na početku: bez njega Excel pogrešno prikazuje š, č, ž...
  return "﻿" + rows.map((row) => row.map(escapeCell).join(SEPARATOR)).join("\r\n") + "\r\n";
};
