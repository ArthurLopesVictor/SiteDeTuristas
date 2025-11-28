import { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle2, XCircle, Search, Heart, ExternalLink, Map } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AllMarketsMap } from './AllMarketsMap';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { getTranslatedMarketData } from '../utils/translatedData';

interface Market {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  hours?: string;
  category?: string;
  products?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  photos?: string[];
  is_verified: boolean;
  created_by_user_id: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  lat?: number;
  lng?: number;
}

interface AllMarketsPageProps {
  onMarketSelect: (marketId: string) => void;
}

export function AllMarketsPage({ onMarketSelect }: AllMarketsPageProps) {
  const { t } = useLanguage();
  const { user, isAuthenticated, accessToken } = useAuth();
  const [dynamicMarkets, setDynamicMarkets] = useState<Market[]>([]);
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMarkets();
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterMarkets();
  }, [searchQuery, allMarkets]);

  // Combine static markets with dynamic ones
  useEffect(() => {
    const staticMarkets = getTranslatedMarketData(t).map(market => ({
      id: market.id,
      name: market.name,
      description: market.description,
      address: market.location,
      phone: '',
      hours: market.hours,
      category: market.highlights.join(', '),
      products: market.highlights.join(', '),
      website: '',
      instagram: '',
      facebook: '',
      photos: market.gallery || [market.image],
      is_verified: true,
      created_by_user_id: 'system',
      created_by_name: 'Mercados de Recife',
      created_at: new Date('2024-01-01').toISOString(),
      updated_at: new Date('2024-01-01').toISOString(),
      lat: market.lat,
      lng: market.lng,
    }));

    // Combine static and dynamic markets
    setAllMarkets([...staticMarkets, ...dynamicMarkets]);
  }, [dynamicMarkets, t]);

  const loadMarkets = async () => {
    try {
      setLoading(true);

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets`;
      console.log('[AllMarketsPage] Fetching markets from:', url);

      // Try with anon key first (Supabase requires this for Edge Functions)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization if user is authenticated, otherwise use anon key
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('[AllMarketsPage] Using user access token');
      } else {
        // Import the publicAnonKey from supabase info
        const { publicAnonKey } = await import('../utils/supabase/info');
        headers['Authorization'] = `Bearer ${publicAnonKey}`;
        console.log('[AllMarketsPage] Using ANON_KEY (public access)');
      }

      console.log('[AllMarketsPage] Request headers:', { ...headers, 'Authorization': 'Bearer ***' });
      const response = await fetch(url, { headers });

      console.log('[AllMarketsPage] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AllMarketsPage] Error response:', errorText);
        // Don't throw error - just show empty list with user-created markets
        console.log('[AllMarketsPage] No markets found or API error, showing empty list');
        setDynamicMarkets([]);
      } else {
        const data = await response.json();
        console.log('[AllMarketsPage] Received data:', data);
        setDynamicMarkets(data.markets || []);
      }
    } catch (err) {
      console.error('Error loading markets:', err);
      // Don't show error, just set empty array
      setDynamicMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      if (!accessToken) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      const favoriteIds = new Set(data.favorites?.markets?.map((m: any) => m.id) || []);
      setFavorites(favoriteIds);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const filterMarkets = () => {
    if (!searchQuery.trim()) {
      setFilteredMarkets(allMarkets);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allMarkets.filter(market =>
      market.name.toLowerCase().includes(query) ||
      market.description.toLowerCase().includes(query) ||
      market.address.toLowerCase().includes(query)
    );

    setFilteredMarkets(filtered);
  };

  const toggleFavorite = async (marketId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated || !accessToken) {
      toast.error(t('search.loginToFavorite'));
      return;
    }

    try {
      const isFavorite = favorites.has(marketId);
      const market = allMarkets.find(m => m.id === marketId);

      if (isFavorite) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites/market/${marketId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to remove favorite');

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(marketId);
          return newSet;
        });
        toast.success(t('search.removedFromFavorites'));
      } else {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              type: 'market',
              target_id: marketId,
              target_name: market?.name || 'Market',
            }),
          }
        );

        if (!response.ok) throw new Error('Failed to add favorite');

        setFavorites(prev => new Set(prev).add(marketId));
        toast.success(t('search.addedToFavorites'));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error(t('search.favoriteError'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('auth.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4">{t('allMarkets.title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('allMarkets.subtitle')}
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('allMarkets.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            {t('allMarkets.marketsFound').replace('{count}', filteredMarkets.length.toString())}
          </p>
        </div>

        {/* Markets Grid */}
        {filteredMarkets.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-muted-foreground mb-4">{t('allMarkets.noMarkets')}</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? t('allMarkets.tryDifferentSearch') 
                : t('allMarkets.beFirstToAdd')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <Card 
                key={market.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => onMarketSelect(market.id)}
              >
                {/* Market Image */}
                <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                  {market.photos && market.photos.length > 0 ? (
                    <img
                      src={market.photos[0]}
                      alt={market.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🏪
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(market.id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.has(market.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>

                  {/* Verification Badge */}
                  <div className="absolute top-3 left-3">
                    {market.is_verified ? (
                      <Badge className="bg-green-500 text-white gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t('allMarkets.verified')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        {t('allMarkets.pending')}
                      </Badge>
                    )}
                  </div>

                  {/* Photo Count */}
                  {market.photos && market.photos.length > 1 && (
                    <div className="absolute bottom-3 right-3">
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        📷 {market.photos.length}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="group-hover:text-orange-500 transition-colors">
                      {market.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {market.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground line-clamp-2">{market.address}</span>
                  </div>

                  {/* Hours */}
                  {market.hours && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{market.hours}</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 group-hover:bg-orange-50 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors"
                  >
                    {t('common.viewDetails')}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}