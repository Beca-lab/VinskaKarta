import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Wine } from "lucide-react";

interface AddWineModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (wine: NewWine) => void;
}

export interface NewWine {
  name: string;
  type: string;
  vintage: string;
  region: string;
}

export function AddWineModal({ open, onClose, onSubmit }: AddWineModalProps) {
  const [formData, setFormData] = useState<NewWine>({
    name: "",
    type: "",
    vintage: "",
    region: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.type && formData.vintage && formData.region) {
      onSubmit(formData);
      setFormData({
        name: "",
        type: "",
        vintage: "",
        region: "",
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-amber-50/95 border-2 border-amber-900/30 max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-purple-900" />
            <DialogTitle>Dodaj Novo Vino</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ime Vina</Label>
            <Input
              id="name"
              placeholder="npr. Château Margaux"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tip</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="bg-white/80">
                <SelectValue placeholder="Izaberite tip vina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Crveno Vino">Crveno Vino</SelectItem>
                <SelectItem value="Belo Vino">Belo Vino</SelectItem>
                <SelectItem value="Roze Vino">Roze Vino</SelectItem>
                <SelectItem value="Šampanjac">Šampanjac</SelectItem>
                <SelectItem value="Pjenušavo Vino">Pjenušavo Vino</SelectItem>
                <SelectItem value="Desertno Vino">Desertno Vino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vintage">Godina</Label>
            <Input
              id="vintage"
              type="number"
              placeholder="npr. 2015"
              value={formData.vintage}
              onChange={(e) => setFormData({ ...formData, vintage: e.target.value })}
              className="bg-white/80"
              min="1900"
              max={new Date().getFullYear()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              placeholder="npr. Bordeaux, Francuska"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="bg-white/80"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Otkaži
            </Button>
            <Button type="submit" className="flex-1 bg-purple-900 hover:bg-purple-800">
              Dodaj Vino
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}