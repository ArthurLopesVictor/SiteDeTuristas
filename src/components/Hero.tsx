import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./image/ImageWithFallback";
import { useLanguage } from "../contexts/LanguageContext";

export function Hero() {
  const { t } = useLanguage();
  
  const scrollToMarkets = () => {
    document.getElementById('markets')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1593260085573-8c27e72cdd79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpZmUlMjBicmF6aWwlMjBtYXJrZXR8ZW58MXx8fHwxNzYwMDI3NDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        alt={t('hero.title')}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6">
          {t('hero.title')}
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90">
          {t('hero.subtitle')}
        </p>
        <Button 
          size="lg" 
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6"
          onClick={scrollToMarkets}
        >
          {t('hero.cta')}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
