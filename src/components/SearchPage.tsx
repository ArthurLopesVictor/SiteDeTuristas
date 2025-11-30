import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, MapPin, Heart, Loader2, Store, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getTranslatedVendorsData, getTranslatedMarketData } from '../utils/translatedData';
import { ImageWithFallback } from './image/ImageWithFallback';

interface Market {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  hours: string;
  photos: string[];
  created_by_name: string;
  is_verified: boolean;
  created_at: string;
}

interface Vendor {
  id: string;
  name: string;
  specialty: string;
  market: string;
  location: string;
  story: string;
  image: string;
  verified: boolean;
  products: string[];
}

export function SearchPage() {
  const { user, accessToken } = useAuth();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<{ markets: string[]; vendors: string[] }>({ markets: [], vendors: [] });

  useEffect(() => {
    console.log('[SearchPage] Component mounted, loading data...');
    loadData();
    if (user) {
      console.log('[SearchPage] User is logged in, loading favorites...');
      loadFavorites();
    } else {
      console.log('[SearchPage] No user logged in, skipping favorites');
    }
  }, [user]);

  useEffect(() => {
    console.log('[SearchPage] Triggered filterResults - SearchQuery:', searchQuery, 'Markets:', markets.length, 'Vendors:', vendors.length);
    filterResults();
  }, [searchQuery, markets, vendors]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('[SearchPage] Loading markets and vendors...');
      
      // Load main markets from translated data
      const translatedMarkets = getTranslatedMarketData(t);
      console.log('[SearchPage] Loaded translated markets:', translatedMarkets.length);
      
      // Transform translated markets to match the Market interface
      const transformedTranslatedMarkets: Market[] = translatedMarkets.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        address: m.location,
        phone: '',
        hours: m.hours,
        photos: m.gallery,
        created_by_name: 'Sistema',
        is_verified: true,
        created_at: new Date().toISOString(),
      }));
      
      // Load user-created markets
      const marketsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (marketsResponse.ok) {
        const marketsData = await marketsResponse.json();
        const dbMarkets = marketsData.markets || [];
        console.log('[SearchPage] Loaded database markets:', dbMarkets.length);
        
        // Combine translated markets with database markets
        const allMarkets = [...transformedTranslatedMarkets, ...dbMarkets];
        console.log('[SearchPage] Total markets:', allMarkets.length);
        setMarkets(allMarkets);
      } else {
        console.error('[SearchPage] Failed to load database markets:', marketsResponse.status);
        // Even if database fails, show the translated markets
        setMarkets(transformedTranslatedMarkets);
      }

      // Load vendors from translated data AND database
      const vendorsData = getTranslatedVendorsData(t);
      console.log('[SearchPage] Loaded translated vendors:', vendorsData.length);
      
      // Also load vendors from Supabase
      const vendorsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/vendors`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (vendorsResponse.ok) {
        const dbVendorsData = await vendorsResponse.json();
        const dbVendors = dbVendorsData.vendors || [];
        console.log('[SearchPage] Loaded database vendors:', dbVendors.length);
        console.log('[SearchPage] Database vendors raw data:', dbVendors);
        
        // Transform database vendors to match the Vendor interface
        const transformedDbVendors = dbVendors.map((v: any) => {
          // Check if photo is a valid non-empty string
          const hasValidPhoto = v.photo && typeof v.photo === 'string' && v.photo.trim().length > 0;
          
          console.log(`[SearchPage] Processing vendor ${v.name}: hasValidPhoto=${hasValidPhoto}, photo=${v.photo}`);
          
          return {
            id: v.id,
            name: v.name,
            specialty: v.specialty || '',
            market: v.market_name || '',
            location: v.location || '',
            story: v.description || '',
            image: hasValidPhoto ? v.photo : `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.name}`,
            verified: false,
            products: v.products || [],
          };
        });
        
        // Combine translated vendors with database vendors
        const allVendors = [...vendorsData, ...transformedDbVendors];
        console.log('[SearchPage] Total vendors:', allVendors.length);
        console.log('[SearchPage] Transformed DB vendors:', transformedDbVendors);
        setVendors(allVendors);
      } else {
        console.error('[SearchPage] Failed to load database vendors:', vendorsResponse.status);
        setVendors(vendorsData);
      }
    } catch (error) {
      console.error('[SearchPage] Error loading data:', error);
      toast.error(t('search.loadError'));
      // Set empty arrays on error to ensure UI shows properly
      setMarkets([]);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!accessToken) {
      console.log('[SearchPage] No access token available for loading favorites');
      return;
    }

    try {
      console.log('[SearchPage] Loading favorites...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('[SearchPage] Favorites loaded:', data);
        const favoriteMarkets = (data.favorites?.markets || []).map((m: any) => m.id);
        const favoriteVendors = (data.favorites?.vendors || []).map((v: any) => v.id);
        setFavorites({ markets: favoriteMarkets, vendors: favoriteVendors });
      } else {
        console.error('[SearchPage] Failed to load favorites:', response.status, await response.text());
      }
    } catch (error) {
      console.error('[SearchPage] Error loading favorites:', error);
    }
  };

  const filterResults = () => {
    const query = searchQuery.toLowerCase().trim();
    console.log('[SearchPage] Filtering results. Query:', query, 'Markets:', markets.length, 'Vendors:', vendors.length);

    if (!query) {
      console.log('[SearchPage] No query, showing all results');
      setFilteredMarkets(markets);
      setFilteredVendors(vendors);
      return;
    }

    const filteredM = markets.filter(
      (market) =>
        market.name.toLowerCase().includes(query) ||
        market.description.toLowerCase().includes(query) ||
        market.address.toLowerCase().includes(query)
    );

    const filteredV = vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.specialty.toLowerCase().includes(query) ||
        vendor.market.toLowerCase().includes(query)
    );

    console.log('[SearchPage] Filtered results - Markets:', filteredM.length, 'Vendors:', filteredV.length);
    setFilteredMarkets(filteredM);
    setFilteredVendors(filteredV);
  };

  const toggleFavorite = async (type: 'market' | 'vendor', id: string, name: string) => {
    if (!user) {
      console.log('[SearchPage] User not logged in, cannot favorite');
      toast.error(t('search.loginToFavorite'));
      return;
    }

    if (!accessToken) {
      console.error('[SearchPage] No access token available for favoriting');
      toast.error(t('search.favoriteError'));
      return;
    }

    const isFavorited =
      type === 'market' ? favorites.markets.includes(id) : favorites.vendors.includes(id);

    console.log(`[SearchPage] Toggling favorite - Type: ${type}, ID: ${id}, Name: ${name}, Currently favorited: ${isFavorited}`);

    try {
      if (isFavorited) {
        // Remove from favorites
        console.log(`[SearchPage] Removing from favorites: ${type}/${id}`);
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites/${type}/${id}`;
        console.log(`[SearchPage] DELETE request to: ${url}`);
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        console.log(`[SearchPage] Remove favorite response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[SearchPage] Removed from favorites, new data:', data);
          const favoriteMarkets = (data.favorites?.markets || []).map((m: any) => m.id);
          const favoriteVendors = (data.favorites?.vendors || []).map((v: any) => v.id);
          setFavorites({ markets: favoriteMarkets, vendors: favoriteVendors });
          toast.success(t('search.removedFromFavorites'));
        } else {
          const errorText = await response.text();
          console.error('[SearchPage] Failed to remove from favorites:', response.status, errorText);
          if (response.status === 403) {
            toast.error('Erro 403: Acesso negado. Verifique se a edge function está deployada corretamente.');
          } else if (response.status === 401) {
            toast.error('Sessão expirada. Por favor, faça login novamente.');
          } else {
            toast.error(t('search.favoriteError'));
          }
        }
      } else {
        // Add to favorites
        console.log(`[SearchPage] Adding to favorites: ${type}, ${id}, ${name}`);
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites`;
        console.log(`[SearchPage] POST request to: ${url}`);
        console.log(`[SearchPage] Request body:`, { type, target_id: id, target_name: name });
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ type, target_id: id, target_name: name }),
        });

        console.log(`[SearchPage] Add favorite response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[SearchPage] Added to favorites, new data:', data);
          const favoriteMarkets = (data.favorites?.markets || []).map((m: any) => m.id);
          const favoriteVendors = (data.favorites?.vendors || []).map((v: any) => v.id);
          setFavorites({ markets: favoriteMarkets, vendors: favoriteVendors });
          toast.success(t('search.addedToFavorites'));
        } else {
          const errorText = await response.text();
          console.error('[SearchPage] Failed to add to favorites:', response.status, errorText);
          if (response.status === 403) {
            toast.error('Erro 403: Acesso negado. Verifique se a edge function está deployada corretamente.');
          } else if (response.status === 401) {
            toast.error('Sessão expirada. Por favor, faça login novamente.');
          } else {
            toast.error(t('search.favoriteError'));
          }
        }
      }
    } catch (error) {
      console.error('[SearchPage] Error toggling favorite:', error);
      toast.error(t('search.favoriteError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-amber-900 mb-2">{t('search.title')}</h1>
          <p className="text-muted-foreground">{t('search.subtitle')}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="pl-10 h-12"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="markets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              {t('search.marketsTab')} ({filteredMarkets.length})
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('search.vendorsTab')} ({filteredVendors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markets">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : filteredMarkets.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('search.noMarketsFound')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMarkets.map((market) => (
                  <Card key={market.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {market.photos.length > 0 && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={market.photos[0]}
                          alt={market.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">{market.name}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {market.description}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite('market', market.id, market.name)}
                          className="shrink-0"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              favorites.markets.includes(market.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-muted-foreground line-clamp-2">{market.address}</span>
                      </div>
                      {market.hours && (
                        <p className="text-sm text-muted-foreground">{market.hours}</p>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant={market.is_verified ? 'default' : 'secondary'}>
                          {market.is_verified ? t('search.verified') : t('search.pending')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t('search.by')} {market.created_by_name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vendors">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : filteredVendors.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('search.noVendorsFound')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => {
                  console.log(`[SearchPage] Rendering vendor "${vendor.name}", has image: ${!!vendor.image}, image type: ${typeof vendor.image}, image length: ${vendor.image?.length || 0}`);
                  if (vendor.image && vendor.image.length > 50) {
                    console.log(`[SearchPage] Image preview for ${vendor.name}:`, vendor.image.substring(0, 100));
                  }
                  return (
                    <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-48 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                        <ImageWithFallback
                          src={vendor.image}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="line-clamp-1">{vendor.name}</CardTitle>
                            <CardDescription className="line-clamp-1 mt-1">
                              {vendor.specialty}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite('vendor', vendor.id, vendor.name)}
                            className="shrink-0"
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                favorites.vendors.includes(vendor.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium">{vendor.market}</p>
                            <p className="text-muted-foreground">{vendor.location}</p>
                          </div>
                        </div>
                        {vendor.verified && (
                          <Badge variant="default" className="mt-2">
                            {t('search.verified')}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}