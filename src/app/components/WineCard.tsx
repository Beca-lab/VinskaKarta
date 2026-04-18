import { Wine, Star, Trash2 } from "lucide-react";

import type { MouseEvent } from "react";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { Badge } from "./ui/badge";

import { Button } from "./ui/button";

import { AROMA_CATEGORIES, buildAromaLabelIndex } from "../../data/aromas";



function AromaTags({ aromas }: { aromas: string[] }) {
  const labelIndex = useMemo(() => buildAromaLabelIndex(AROMA_CATEGORIES), []);

  return (
    <div className="flex flex-wrap gap-1">
      {aromas.slice(0, 3).map((aromaId, idx) => (
        <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
          {labelIndex[aromaId] || aromaId}
        </span>
      ))}
      {aromas.length > 3 && (
        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
          +{aromas.length - 3}
        </span>
      )}
    </div>
  );
}

interface WineCardProps {

  name: string;
  type?: string;
  vintage?: string;

  region?: string;

  composition?: "Cisto" | "Kupaza";

  variety?: string;

  blend?: Array<{ grape: string; percent: number }>;

  aromas?: string[];

  rating?: number;

  onRate: () => void;

  onDelete: () => void;

}



export function WineCard({ name, type, vintage, region, composition, variety, blend, aromas, rating, onRate, onDelete }: WineCardProps) {

  const handleDelete = (e: MouseEvent) => {

    e.stopPropagation();

    if (window.confirm(`Da li ste sigurni da želite da obrišete "${name}"?`)) {

      onDelete();

    }

  };



  const compositionLabel = composition === "Cisto" ? "Čisto" : composition === "Kupaza" ? "Kupaža" : undefined;

  const blendText =

    composition === "Kupaza" && blend && blend.length > 0

      ? blend

          .slice()

          .sort((a, b) => b.percent - a.percent)

          .map((c) => `${c.grape} ${c.percent}%`)

          .join(", ")

      : undefined;

  const varietyText = composition === "Cisto" && variety ? variety : undefined;



  return (

    <Card className="bg-amber-50/90 border-amber-900/20 hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98] relative" onClick={onRate}>

      <CardHeader className="pb-3">

        <div className="flex items-start justify-between gap-2">

          <div className="flex items-start gap-2 flex-1 min-w-0 pr-2">

            <Wine className="w-5 h-5 text-purple-900 flex-shrink-0 mt-1" />

            <CardTitle className="text-lg break-words">{name}</CardTitle>

          </div>

          <Button

            variant="ghost"

            size="sm"

            className="flex-shrink-0 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 z-10"

            onClick={handleDelete}

          >

            <Trash2 className="w-4 h-4" />

          </Button>

        </div>

      </CardHeader>

      <CardContent>

        <div className="space-y-2">

          <div className="flex gap-2 flex-wrap">

            {type ? (

              <Badge variant="secondary" className="bg-purple-100 text-purple-900">

                {type}

              </Badge>

            ) : null}

            {vintage ? (

              <Badge variant="outline" className="border-amber-900/30 text-amber-900">

                {vintage}

              </Badge>

            ) : null}

            {compositionLabel ? (

              <Badge variant="outline" className="border-purple-900/30 text-purple-900 bg-white/60">

                {compositionLabel}

              </Badge>

            ) : null}

          </div>

          {varietyText ? (

            <p className="text-xs text-slate-700">{varietyText}</p>

          ) : null}

          {blendText ? (

            <p className="text-xs text-slate-700 break-words">{blendText}</p>

          ) : null}

          {aromas && aromas.length > 0 ? (

            <AromaTags aromas={aromas} />

          ) : null}

          <div className="flex items-end justify-between gap-2">

            {region ? <p className="text-sm text-slate-600 flex-1">{region}</p> : <div className="flex-1" />}

            {rating !== undefined ? (

              <div className="flex items-center gap-1.5 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-500 rounded-md px-2.5 py-1 shadow-sm flex-shrink-0">

                <Star className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />

                <span className="text-sm font-bold text-purple-900">{rating.toFixed(1)}</span>

              </div>

            ) : (

              <div className="flex items-center justify-center bg-slate-100 border border-slate-300 rounded-md px-2 py-1 flex-shrink-0">

                <span className="text-[10px] text-slate-500 whitespace-nowrap">Nije ocenjeno</span>

              </div>

            )}

          </div>

        </div>

      </CardContent>

    </Card>

  );

}