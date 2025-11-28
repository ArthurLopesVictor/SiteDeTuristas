import { Card, CardContent } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface ExperienceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ExperienceCard({ icon: Icon, title, description }: ExperienceCardProps) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <Icon className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="mb-3">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
