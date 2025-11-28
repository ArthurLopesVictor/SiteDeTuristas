import { useEffect } from 'react';
import { Hero } from './Hero';
import { MarketCard } from './MarketCard';
import { ExperienceCard } from './ExperienceCard';
import { DeployAlert } from './DeployAlert';
import { Button } from './ui/button';
import { ShoppingBag, UtensilsCrossed, Palette, Music, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Market {
  id: string;
  name: string;
  description: string;
  location: string;
  hours: string;
  image: string;
  highlights: string[];
}

interface HomePageProps {
  markets: Market[];
  onMarketSelect: (marketId: string) => void;
  scrollToMarkets?: boolean;
}

export function HomePage({ markets, onMarketSelect, scrollToMarkets }: HomePageProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollToMarkets) {
      setTimeout(() => {
        document.getElementById('markets')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [scrollToMarkets]);

  const experiences = [
    {
      icon: UtensilsCrossed,
      title: t('home.experience.gastronomy.title'),
      description: t('home.experience.gastronomy.desc'),
    },
    {
      icon: Palette,
      title: t('home.experience.handicrafts.title'),
      description: t('home.experience.handicrafts.desc'),
    },
    {
      icon: Music,
      title: t('home.experience.culture.title'),
      description: t('home.experience.culture.desc'),
    },
    {
      icon: ShoppingBag,
      title: t('home.experience.products.title'),
      description: t('home.experience.products.desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Hero />

      {/* Deploy Alert */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <DeployAlert />
      </div>

      {/* Introdução */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-orange-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mb-6">{t('home.whyVisit.title')}</h2>
          <p className="text-lg text-muted-foreground mb-4">
            {t('home.whyVisit.text1')}
          </p>
          <p className="text-lg text-muted-foreground">
            {t('home.whyVisit.text2')}
          </p>
        </div>
      </section>

      {/* Experiências */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-12">{t('home.experiences.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((exp, index) => (
              <ExperienceCard key={index} icon={exp.icon} title={exp.title} description={exp.description} />
            ))}
          </div>
        </div>
      </section>

      {/* Mercados */}
      <section id="markets" className="py-16 px-4 bg-gradient-to-b from-background to-orange-50/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center mb-4">{t('markets.title')}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('markets.subtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {markets.map((market) => (
              <div key={market.id} onClick={() => onMarketSelect(market.id)} className="cursor-pointer">
                <MarketCard {...market} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dicas */}
      <section className="py-16 px-4 bg-orange-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="mb-4">{t('home.tips.title')}</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{t('home.tips.tip1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{t('home.tips.tip2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{t('home.tips.tip3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{t('home.tips.tip4')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{t('home.tips.tip5')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>{t('home.tips.tip6')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mb-6 text-white">{t('home.cta.title')}</h2>
          <p className="text-xl mb-8 text-white/95">
            {t('home.cta.text')}
          </p>
          <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
            {t('home.cta.button')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <p>Descubra Recife - Mercados Públicos © 2025</p>
          <p className="text-sm mt-2 text-primary-foreground/80">{t('footer.tagline')}</p>
        </div>
      </footer>
    </div>
  );
}
