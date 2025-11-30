import { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle2, Circle, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './image/ImageWithFallback';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface ItineraryStop {
  name: string;
  description: string;
  location: string;
}

interface Itinerary {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  market: string;
  image: string;
  stops: ItineraryStop[];
  checklist: string[];
}

interface ItinerariesPageProps {
  itineraries: Itinerary[];
  onNavigate?: (view: string) => void;
}

export function ItinerariesPage({ itineraries: defaultItineraries, onNavigate }: ItinerariesPageProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedItinerary, setSelectedItinerary] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, Set<number>>>({});
  const [customItineraries, setCustomItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomItineraries();
  }, []);

  const loadCustomItineraries = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/itineraries`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomItineraries(data.itineraries || []);
      }
    } catch (error) {
      console.error('Error loading itineraries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Combine default and custom itineraries
  const allItineraries = [
    ...defaultItineraries,
    ...customItineraries.map(it => ({
      id: it.id,
      title: it.title,
      description: it.description,
      duration: it.duration || 'Duração não especificada',
      difficulty: 'Personalizado',
      market: it.market_id,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      stops: it.stops,
      checklist: [],
    }))
  ];

  const handleChecklistToggle = (itineraryId: string, index: number) => {
    setCheckedItems(prev => {
      const newChecked = { ...prev };
      if (!newChecked[itineraryId]) {
        newChecked[itineraryId] = new Set();
      }
      const itemSet = new Set(newChecked[itineraryId]);
      if (itemSet.has(index)) {
        itemSet.delete(index);
      } else {
        itemSet.add(index);
      }
      newChecked[itineraryId] = itemSet;
      return newChecked;
    });
  };

  const getProgress = (itineraryId: string, totalItems: number) => {
    const checked = checkedItems[itineraryId]?.size || 0;
    return Math.round((checked / totalItems) * 100);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4">{t('itineraries.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('itineraries.subtitle')}
          </p>
          
          {user && onNavigate && (
            <Button
              onClick={() => onNavigate('create-itinerary')}
              className="mt-4"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar Roteiro Personalizado
            </Button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        )}

        {/* Itineraries Grid */}
        {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {allItineraries.map((itinerary) => {
            const isSelected = selectedItinerary === itinerary.id;
            const progress = getProgress(itinerary.id, itinerary.checklist.length);

            return (
              <Card key={itinerary.id} className={`overflow-hidden ${isSelected ? 'ring-2 ring-orange-500' : ''}`}>
                <div className="relative h-48">
                  <ImageWithFallback
                    src={itinerary.image}
                    alt={itinerary.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="mb-2 bg-orange-500">{itinerary.market}</Badge>
                    <h3 className="text-white">{itinerary.title}</h3>
                  </div>
                </div>

                <CardHeader>
                  <p className="text-muted-foreground">{itinerary.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>{itinerary.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span>{itinerary.stops.length} paradas</span>
                    </div>
                    <Badge variant="outline">{itinerary.difficulty}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button
                    variant={isSelected ? 'secondary' : 'default'}
                    className="w-full mb-4"
                    onClick={() => setSelectedItinerary(isSelected ? null : itinerary.id)}
                  >
                    {isSelected ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                  </Button>

                  {isSelected && (
                    <div className="space-y-6 mt-6 pt-6 border-t">
                      {/* Stops */}
                      <div>
                        <h4 className="mb-4">Roteiro</h4>
                        <div className="space-y-4">
                          {itinerary.stops.map((stop, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="mb-1">{stop.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {stop.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {stop.location}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Checklist */}
                      {itinerary.checklist && itinerary.checklist.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4>{t('itineraries.checklist')}</h4>
                            <span className="text-sm text-muted-foreground">
                              {progress}% completo
                            </span>
                          </div>
                          <div className="w-full h-2 bg-accent rounded-full mb-4 overflow-hidden">
                            <div
                              className="h-full bg-orange-500 transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="space-y-3">
                            {itinerary.checklist.map((item, index) => {
                              const isChecked = checkedItems[itinerary.id]?.has(index) || false;
                              return (
                                <div key={index} className="flex items-start gap-3">
                                  <Checkbox
                                    id={`${itinerary.id}-${index}`}
                                    checked={isChecked}
                                    onCheckedChange={() => handleChecklistToggle(itinerary.id, index)}
                                    className="mt-1"
                                  />
                                  <label
                                    htmlFor={`${itinerary.id}-${index}`}
                                    className={`flex-1 cursor-pointer ${
                                      isChecked ? 'line-through text-muted-foreground' : ''
                                    }`}
                                  >
                                    {item}
                                  </label>
                                  {isChecked && <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}

        {!loading && allItineraries.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhum roteiro disponível ainda
              </p>
              {user && onNavigate && (
                <Button onClick={() => onNavigate('create-itinerary')}>
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeiro Roteiro
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
