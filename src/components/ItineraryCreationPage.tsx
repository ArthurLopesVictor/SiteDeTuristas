import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Clock, Loader2, Save, Plus, X, Route } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Stop {
  name: string;
  description: string;
  location: string;
}

interface Market {
  id: string;
  name: string;
}

export function ItineraryCreationPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { user, accessToken } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  
  const [marketId, setMarketId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [stops, setStops] = useState<Stop[]>([{ name: '', description: '', location: '' }]);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    setLoadingMarkets(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMarkets(data.markets || []);
      }
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoadingMarkets(false);
    }
  };

  const handleAddStop = () => {
    setStops([...stops, { name: '', description: '', location: '' }]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length > 1) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const handleStopChange = (index: number, field: keyof Stop, value: string) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    setStops(newStops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!marketId || !title.trim() || !description.trim()) {
      toast.error('Mercado, título e descrição são obrigatórios');
      return;
    }

    // Validate that at least one stop has name
    const validStops = stops.filter(stop => stop.name.trim());
    if (validStops.length === 0) {
      toast.error('Adicione pelo menos uma parada ao roteiro');
      return;
    }

    if (!accessToken) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/itineraries`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            market_id: marketId,
            title,
            description,
            duration,
            stops: validStops,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao criar roteiro');
        return;
      }

      toast.success('Roteiro criado com sucesso!');
      
      // Reset form
      setMarketId('');
      setTitle('');
      setDescription('');
      setDuration('');
      setStops([{ name: '', description: '', location: '' }]);
      
      // Navigate to itineraries page
      setTimeout(() => {
        onNavigate('itineraries');
      }, 1500);
    } catch (error) {
      console.error('Itinerary creation error:', error);
      toast.error('Erro ao criar roteiro');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Você precisa estar logado para criar roteiros</p>
            <Button onClick={() => onNavigate('login')} className="mt-4">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-amber-900 mb-2">Criar Roteiro Personalizado</h1>
          <p className="text-muted-foreground">
            Compartilhe um roteiro especial para ajudar visitantes a explorarem os mercados
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novo Roteiro</CardTitle>
            <CardDescription>
              Crie um roteiro com as melhores paradas e experiências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="market">Mercado *</Label>
                <Select value={marketId} onValueChange={setMarketId} disabled={loadingMarkets}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingMarkets ? 'Carregando...' : 'Selecione o mercado'} />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título do Roteiro *</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Tour Gastronômico Completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o que torna este roteiro especial..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração Estimada</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="pl-10"
                    placeholder="Ex: 2-3 horas"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Paradas do Roteiro *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddStop}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Parada
                  </Button>
                </div>

                {stops.map((stop, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                            {index + 1}
                          </div>
                          <span>Parada {index + 1}</span>
                        </div>
                        {stops.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStop(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <Input
                        type="text"
                        value={stop.name}
                        onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                        placeholder="Nome da parada"
                        required
                      />

                      <Textarea
                        value={stop.description}
                        onChange={(e) => handleStopChange(index, 'description', e.target.value)}
                        placeholder="O que fazer ou ver aqui..."
                        rows={2}
                      />

                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={stop.location}
                          onChange={(e) => handleStopChange(index, 'location', e.target.value)}
                          className="pl-10"
                          placeholder="Localização dentro do mercado"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando Roteiro...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Criar Roteiro
                    </>
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                * Campos obrigatórios
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
