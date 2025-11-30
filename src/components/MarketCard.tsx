import { Card, CardContent } from "./ui/card";
import { MapPin, Clock } from "lucide-react";
import { ImageWithFallback } from "./image/ImageWithFallback";

interface MarketCardProps {
  name: string;
  description: string;
  location: string;
  hours: string;
  image: string;
  highlights: string[];
}

export function MarketCard({ name, description, location, hours, image, highlights }: MarketCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <ImageWithFallback
        src={image}
        alt={name}
        className="w-full h-64 object-cover"
      />
      <CardContent className="p-6">
        <h3 className="mb-3">{name}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
            <span>{location}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
            <span>{hours}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm mb-2">Destaques:</p>
          <div className="flex flex-wrap gap-2">
            {highlights.map((highlight, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
