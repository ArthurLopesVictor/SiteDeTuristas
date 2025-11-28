import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, CheckCircle2, Store } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../utils/supabase/info';
import { ImageUpload } from './ImageUpload';
import { toast } from 'sonner@2.0.3';

const PRODUCT_OPTIONS = [
  { value: 'Ervas', key: 'productErvas' },
  { value: 'Especiarias', key: 'productEspeciarias' },
  { value: 'Artesanato', key: 'productArtesanato' },
  { value: 'Comida', key: 'productComida' },
  { value: 'Frutas', key: 'productFrutas' },
  { value: 'Cerâmica', key: 'productCeramica' },
  { value: 'Chás', key: 'productChas' },
  { value: 'Tapioca', key: 'productTapioca' },
];

// Static markets will be combined with dynamic markets from API
const STATIC_MARKETS = [
  { id: 'sao-jose', name: 'Mercado de São José' },
  { id: 'boa-vista', name: 'Mercado da Boa Vista' },
  { id: 'casa-amarela', name: 'Mercado de Casa Amarela' },
];

const BADGE_OPTIONS = [
  { value: 'Feito à Mão', key: 'badgeHandmade' },
  { value: 'Produção Local', key: 'badgeLocal' },
  { value: 'Receita de Família', key: 'badgeFamily' },
];

interface VendorFormData {
  name: string;
  description: string;
  specialty: string;
  market_id: string;
  market_name: string;
  products: string[];
  location: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  badges: string[];
  image: string;
}

interface Market {
  id: string;
  name: string;
}

interface VendorRegistrationFormProps {
  editingVendor?: {
    id: string;
    name: string;
    description?: string;
    specialty: string;
    market: string;
    products: string[];
    location: string;
    badges?: string[];
    image?: string;
  } | null;
  onEditComplete?: () => void;
  onCreateComplete?: () => void; // Novo callback para quando criar um vendedor
}

export function VendorRegistrationForm({ editingVendor, onEditComplete, onCreateComplete }: VendorRegistrationFormProps) {
  const { t } = useLanguage();
  const { user, accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  
  const [formData, setFormData] = useState<VendorFormData>({
    name: editingVendor?.name || '',
    description: editingVendor?.description || '',
    specialty: editingVendor?.specialty || '',
    market_id: '',
    market_name: '',
    products: editingVendor?.products || [],
    location: editingVendor?.location || '',
    phone: '',
    whatsapp: '',
    instagram: '',
    badges: editingVendor?.badges || [],
    image: editingVendor?.image || '',
  });

  // Load markets from API
  useEffect(() => {
    const loadMarkets = async () => {
      try {
        setLoadingMarkets(true);
        const { publicAnonKey } = await import('../utils/supabase/info');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const dynamicMarkets = data.markets.map((m: any) => ({
            id: m.id,
            name: m.name
          }));
          
          // Combine static and dynamic markets
          setMarkets([...STATIC_MARKETS, ...dynamicMarkets]);
        } else {
          // If API fails, just use static markets
          setMarkets(STATIC_MARKETS);
        }
      } catch (error) {
        console.error('Error loading markets:', error);
        setMarkets(STATIC_MARKETS);
      } finally {
        setLoadingMarkets(false);
      }
    };

    loadMarkets();
  }, []);

  // Update form when editing vendor changes
  useEffect(() => {
    if (editingVendor) {
      setFormData({
        name: editingVendor.name,
        description: editingVendor.description || '',
        specialty: editingVendor.specialty,
        market_id: editingVendor.market || '',
        market_name: editingVendor.market || '',
        products: editingVendor.products,
        location: editingVendor.location,
        phone: '',
        whatsapp: '',
        instagram: '',
        badges: editingVendor.badges || [],
        image: editingVendor.image || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        specialty: '',
        market_id: '',
        market_name: '',
        products: [],
        location: '',
        phone: '',
        whatsapp: '',
        instagram: '',
        badges: [],
        image: '',
      });
    }
  }, [editingVendor]);

  const handleProductToggle = (product: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter(p => p !== product)
        : [...prev.products, product],
    }));
  };

  const handleBadgeToggle = (badge: string) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  const handleMarketChange = (marketId: string) => {
    const selectedMarket = markets.find(m => m.id === marketId);
    setFormData({
      ...formData,
      market_id: marketId,
      market_name: selectedMarket?.name || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !accessToken) {
      toast.error('Você precisa estar logado para cadastrar um vendedor');
      setSubmitStatus('error');
      return;
    }

    if (!formData.market_id) {
      toast.error('Por favor, selecione um mercado');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const vendorData = {
        name: formData.name,
        specialty: formData.specialty,
        market_id: formData.market_id,
        market_name: formData.market_name,
        location: formData.location,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        description: formData.description,
        photo: formData.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        products: formData.products,
        badges: formData.badges,
      };

      const url = editingVendor 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/vendors/${editingVendor.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/vendors`;

      const response = await fetch(url, {
        method: editingVendor ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(vendorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar vendedor');
      }

      setSubmitStatus('success');
      toast.success(editingVendor ? 'Vendedor atualizado com sucesso!' : 'Vendedor cadastrado com sucesso!');
      
      if (editingVendor) {
        setTimeout(() => {
          setSubmitStatus('idle');
          onEditComplete?.();
        }, 2000);
      } else {
        // Reset form
        setFormData({
          name: '',
          description: '',
          specialty: '',
          market_id: '',
          market_name: '',
          products: [],
          location: '',
          phone: '',
          whatsapp: '',
          instagram: '',
          badges: [],
          image: '',
        });

        // Clear success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
        onCreateComplete?.(); // Chama o callback de criação
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      setSubmitStatus('error');
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar vendedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('vendors.loginRequired')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <Store className="h-8 w-8 text-orange-600" />
        </div>
        <h2>{t('vendors.registerTitle')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('vendors.registerSubtitle')}
        </p>
      </div>

      {submitStatus === 'success' && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {t('vendors.successMessage')}
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('vendors.errorMessage')}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-lg border">
        {/* Foto do Vendedor */}
        <ImageUpload
          label={t('vendors.formPhoto')}
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
        />

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name">{t('vendors.formName')}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('vendors.formNamePlaceholder')}
            required
          />
        </div>

        {/* Descrição/História */}
        <div className="space-y-2">
          <Label htmlFor="description">{t('vendors.formDescription')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('vendors.formDescriptionPlaceholder')}
            rows={4}
            required
          />
        </div>

        {/* Especialidade */}
        <div className="space-y-2">
          <Label htmlFor="specialty">{t('vendors.formSpecialty')}</Label>
          <Input
            id="specialty"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            placeholder={t('vendors.formSpecialtyPlaceholder')}
            required
          />
        </div>

        {/* Mercado */}
        <div className="space-y-2">
          <Label htmlFor="market">{t('vendors.formMarket')}</Label>
          <Select 
            value={formData.market_id} 
            onValueChange={handleMarketChange}
            disabled={loadingMarkets}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingMarkets ? 'Carregando mercados...' : t('vendors.formMarketPlaceholder')} />
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

        {/* Localização da Banca */}
        <div className="space-y-2">
          <Label htmlFor="location">{t('vendors.formLocation')}</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder={t('vendors.formLocationPlaceholder')}
            required
          />
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(81) 99999-9999"
          />
        </div>

        {/* WhatsApp */}
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="(81) 99999-9999"
          />
        </div>

        {/* Instagram */}
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            placeholder="@seuperfil"
          />
        </div>

        {/* Produtos */}
        <div className="space-y-3">
          <Label>{t('vendors.formProducts')}</Label>
          <div className="grid grid-cols-2 gap-3">
            {PRODUCT_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={formData.products.includes(option.value)}
                  onCheckedChange={() => handleProductToggle(option.value)}
                />
                <label
                  htmlFor={option.value}
                  className="text-sm cursor-pointer select-none"
                >
                  {t(`vendors.${option.key}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Selos de Autenticidade */}
        <div className="space-y-3">
          <Label>{t('vendors.formBadges')}</Label>
          <p className="text-sm text-muted-foreground">{t('vendors.formBadgesDescription')}</p>
          <div className="grid grid-cols-1 gap-3">
            {BADGE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`badge-${option.value}`}
                  checked={formData.badges.includes(option.value)}
                  onCheckedChange={() => handleBadgeToggle(option.value)}
                />
                <label
                  htmlFor={`badge-${option.value}`}
                  className="text-sm cursor-pointer select-none"
                >
                  {t(`vendors.${option.key}`)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={isSubmitting || formData.products.length === 0}
        >
          {isSubmitting 
            ? (editingVendor ? t('vendors.updating') : t('vendors.submitting'))
            : (editingVendor ? t('vendors.updateButton') : t('vendors.submitButton'))
          }
        </Button>
      </form>
    </div>
  );
}