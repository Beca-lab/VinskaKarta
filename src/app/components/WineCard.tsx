import { Wine, Star, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface WineCardProps {
  name: string;
  type: string;
  vintage: string;
  region: string;
  rating?: number;
  onRate: () => void;
  onDelete: () => void;
}

export function WineCard({ name, type, vintage, region, rating, onRate, onDelete }: WineCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Da li ste sigurni da želite da obrišete "${name}"?`)) {
      onDelete();
    }
  };

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
            <Badge variant="secondary" className="bg-purple-100 text-purple-900">
              {type}
            </Badge>
            <Badge variant="outline" className="border-amber-900/30 text-amber-900">
              {vintage}
            </Badge>
          </div>
          <div className="flex items-end justify-between gap-2">
            <p className="text-sm text-slate-600 flex-1">{region}</p>
            {rating !== undefined ? (
              <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full px-2 py-1 shadow-md flex-shrink-0">
                <Star className="w-3 h-3 fill-white text-white" />
                <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-gray-200 text-gray-500 rounded-full px-2 py-1 flex-shrink-0">
                <span className="text-[9px] font-medium">Nije ocenjeno</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}