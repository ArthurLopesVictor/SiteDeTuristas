import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Tag, Users, Heart, Phone, Instagram } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapEmbed } from './MapEmbed';
import { ImageWithFallback } from './image/ImageWithFallback';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Market {
  id: string;
  name: string;
  description: string;
  location: string;
  hours: string;
  image: string;
  highlights: string[];
  history: string;
  products: { category: string; items: string[] }[];
  gallery: string[];
  vendors: { name: string; specialty: string; location: string; image: string }[];
  lat: number;
  lng: number;
}

interface MarketDetailPageProps {
  market: Market;
  onBack: () => void;
  onVendorClick?: (vendorName: string) => void;
}

export function MarketDetailPage({ market, onBack, onVendorClick }: MarketDetailPageProps) {
  const { t } = useLanguage();
  const { user, accessToken } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dynamicVendors, setDynamicVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);

  useEffect(() => {
    if (user) {
      checkIfFavorite();
    }
    loadVendors();
  }, [user, market.id]);

  const loadVendors = async () => {
    try {
      setLoadingVendors(true);
      const { publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/vendors?market=${market.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDynamicVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoadingVendors(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const favoriteMarkets = data.favorites.markets.map((m: any) => m.id);
        setIsFavorite(favoriteMarkets.includes(market.id));
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error(t('search.loginToFavorite'));
      return;
    }

    if (!accessToken) {
      toast.error(t('search.favoriteError'));
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites/market/${market.id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.ok) {
          setIsFavorite(false);
          toast.success(t('search.removedFromFavorites'));
        }
      } else {
        // Add to favorites
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ type: 'market', target_id: market.id, target_name: market.name }),
          }
        );

        if (response.ok) {
          setIsFavorite(true);
          toast.success(t('search.addedToFavorites'));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(t('search.favoriteError'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Image */}
      <div className="relative h-96">
        <ImageWithFallback
          src={market.image}
          alt={market.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        
        {/* Back Button */}
        <Button
          variant="secondary"
          className="absolute top-4 left-4"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Favorite Button */}
        <Button
          variant="secondary"
          className="absolute top-4 right-4"
          onClick={toggleFavorite}
          disabled={loading}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </Button>
        
        {/* Market Name */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-white mb-2">{market.name}</h1>
            <p className="text-lg text-white/90">{market.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-start gap-3 p-4 bg-accent rounded-lg">
            <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('common.location')}</p>
              <p>{market.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-accent rounded-lg">
            <Clock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('common.hours')}</p>
              <p>{market.hours}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-accent rounded-lg">
            <Tag className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('common.highlights')}</p>
              <div className="flex flex-wrap gap-1">
                {market.highlights.map((highlight, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="about">{t('market.about')}</TabsTrigger>
            <TabsTrigger value="products">{t('market.products')}</TabsTrigger>
            <TabsTrigger value="map">{t('market.howToGet')}</TabsTrigger>
            <TabsTrigger value="gallery">{t('market.gallery')}</TabsTrigger>
            <TabsTrigger value="vendors">{t('market.featuredVendors')}</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <div className="prose max-w-none">
              <h3>{t('market.history')}</h3>
              <p className="text-muted-foreground">{market.history}</p>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {market.products.map((category, index) => (
                <div key={index} className="p-6 border rounded-lg">
                  <h4 className="mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-500" />
                    {category.category}
                  </h4>
                  <ul className="space-y-2">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <MapEmbed 
              location={market.location} 
              marketName={market.name}
              lat={market.lat}
              lng={market.lng}
            />
            <div className="mt-6 p-6 bg-accent rounded-lg">
              <h4 className="mb-4">Dicas de Transporte</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Ônibus: Várias linhas passam próximo ao mercado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Táxi/Uber: Ponto de embarque próximo à entrada principal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Estacionamento: Disponível nas proximidades</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {market.gallery.map((image, index) => (
                <div key={index} className="relative h-64 rounded-lg overflow-hidden group">
                  <ImageWithFallback
                    src={image}
                    alt={`${market.name} - Imagem ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="mt-6">
            {loadingVendors ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando vendedores...
              </div>
            ) : (
              <>
                {/* Dynamic vendors from API */}
                {dynamicVendors.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4">Vendedores Cadastrados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dynamicVendors.map((vendor) => (
                        <div 
                          key={vendor.id} 
                          className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                          <div className="relative h-48">
                            <ImageWithFallback
                              src={vendor.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${vendor.name}`}
                              alt={vendor.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            
                            {/* Verification Badge */}
                            <div className="absolute top-3 left-3">
                              {vendor.is_verified && (
                                <Badge className="bg-green-500 text-white">
                                  Verificado
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-4">
                            <h4 className="mb-2 group-hover:text-orange-600 transition-colors">{vendor.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{vendor.specialty}</p>
                            
                            {vendor.location && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <MapPin className="h-3 w-3" />
                                {vendor.location}
                              </div>
                            )}
                            
                            {/* Contact info */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {vendor.phone && (
                                <a 
                                  href={`tel:${vendor.phone}`}
                                  className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="h-3 w-3" />
                                  {vendor.phone}
                                </a>
                              )}
                              {vendor.instagram && (
                                <a 
                                  href={`https://instagram.com/${vendor.instagram.replace('@', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Instagram className="h-3 w-3" />
                                  {vendor.instagram}
                                </a>
                              )}
                            </div>
                            
                            {vendor.description && (
                              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
                                {vendor.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Static vendors */}
                {market.vendors && market.vendors.length > 0 && (
                  <div>
                    {dynamicVendors.length > 0 && <h3 className="mb-4">Vendedores em Destaque</h3>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {market.vendors.map((vendor, index) => (
                        <div 
                          key={index} 
                          className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                          onClick={() => onVendorClick?.(vendor.name)}
                        >
                          <div className="relative h-48">
                            <ImageWithFallback
                              src={vendor.image}
                              alt={vendor.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                          <div className="p-4">
                            <h4 className="mb-2 group-hover:text-orange-600 transition-colors">{vendor.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{vendor.specialty}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {vendor.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No vendors at all */}
                {dynamicVendors.length === 0 && (!market.vendors || market.vendors.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    {t('vendors.noVendors')}
                  </p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}