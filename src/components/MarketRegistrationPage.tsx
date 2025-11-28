import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { MapPin, Clock, Phone, Image as ImageIcon, Loader2, Save, Plus, X, Tag as TagIcon, Globe, Instagram as InstagramIcon, Facebook as FacebookIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { MultiImageUpload } from './MultiImageUpload';

export function MarketRegistrationPage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { user, accessToken } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !address.trim()) {
      toast.error(t('marketReg.requiredFields'));
      return;
    }

    if (!accessToken) {
      console.error('[MarketReg] No access token available');
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    setLoading(true);
    console.log('[MarketReg] Creating market with data:', {
      name,
      description,
      address,
      phone,
      hours,
      category,
      products,
      photos: photos.length,
    });

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets`;
      console.log('[MarketReg] POST request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          address,
          phone,
          hours,
          category,
          products,
          website,
          instagram,
          facebook,
          photos,
        }),
      });

      console.log('[MarketReg] Response status:', response.status);
      const data = await response.json();
      console.log('[MarketReg] Response data:', data);

      if (!response.ok) {
        console.error('[MarketReg] Failed to create market:', response.status, data);
        if (response.status === 403) {
          toast.error('Erro 403: Acesso negado. Verifique se a edge function está deployada corretamente.');
        } else if (response.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
        } else {
          toast.error(data.error || t('marketReg.createError'));
        }
        return;
      }

      console.log('[MarketReg] Market created successfully:', data.market);
      toast.success(t('marketReg.createSuccess'));
      
      // Reset form
      setName('');
      setDescription('');
      setAddress('');
      setPhone('');
      setHours('');
      setCategory('');
      setProducts('');
      setWebsite('');
      setInstagram('');
      setFacebook('');
      setPhotos([]);
      
      // Navigate to search page to see the new market
      console.log('[MarketReg] Navigating to search page in 1.5s...');
      setTimeout(() => {
        console.log('[MarketReg] Navigating to search page now');
        onNavigate('search');
      }, 1500);
    } catch (error) {
      console.error('[MarketReg] Market creation error:', error);
      toast.error(t('marketReg.createError'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{t('marketReg.loginRequired')}</p>
            <Button onClick={() => onNavigate('login')} className="mt-4">
              {t('nav.login')}
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
          <h1 className="text-amber-900 mb-2">{t('marketReg.title')}</h1>
          <p className="text-muted-foreground">{t('marketReg.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('marketReg.formTitle')}</CardTitle>
            <CardDescription>{t('marketReg.formDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('marketReg.nameLabel')} *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('marketReg.namePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('marketReg.descriptionLabel')} *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('marketReg.descriptionPlaceholder')}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('marketReg.addressLabel')} *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10"
                    placeholder={t('marketReg.addressPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('marketReg.phoneLabel')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      placeholder={t('marketReg.phonePlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">{t('marketReg.hoursLabel')}</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hours"
                      type="text"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="pl-10"
                      placeholder={t('marketReg.hoursPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria do Mercado</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="público">Mercado Público</SelectItem>
                    <SelectItem value="comunitário">Mercado Comunitário</SelectItem>
                    <SelectItem value="feira">Feira Livre</SelectItem>
                    <SelectItem value="shopping-popular">Shopping Popular</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="products">Principais Produtos</Label>
                <Textarea
                  id="products"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  placeholder="Ex: Artesanato, Frutas, Roupas, Eletrônicos..."
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Redes Sociais e Website</Label>
                
                <div className="space-y-2">
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="pl-10"
                      placeholder="Website (opcional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <InstagramIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="pl-10"
                      placeholder="@instagram (opcional)"
                    />
                  </div>

                  <div className="relative">
                    <FacebookIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="pl-10"
                      placeholder="Facebook (opcional)"
                    />
                  </div>
                </div>
              </div>

              <MultiImageUpload
                label={t('marketReg.photosLabel')}
                value={photos}
                onChange={setPhotos}
                maxImages={10}
              />

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('marketReg.creating')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('marketReg.createButton')}
                    </>
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                * {t('marketReg.requiredFieldsNote')}
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
