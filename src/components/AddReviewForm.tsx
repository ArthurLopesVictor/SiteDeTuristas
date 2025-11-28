import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Star, Image as ImageIcon, Plus, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { MultiImageUpload } from './MultiImageUpload';

interface Review {
  id: string;
  author: string;
  authorAvatar: string;
  rating: number;
  date: string;
  market: string;
  vendor_name?: string;
  vendor_id?: string;
  review_type?: 'market' | 'vendor';
  comment: string;
  helpful: number;
  photos?: string[];
  user_id?: string;
}

interface AddReviewFormProps {
  reviewType: 'market' | 'vendor';
  editingReview?: Review | null;
  onReviewAdded: () => void;
}

interface Vendor {
  id: string;
  name: string;
  market: string;
}

const MARKETS = [
  { id: 'sao-jose', name: 'Mercado de São José' },
  { id: 'boa-vista', name: 'Mercado da Boa Vista' },
  { id: 'casa-amarela', name: 'Mercado de Casa Amarela' },
];

export function AddReviewForm({ reviewType, editingReview, onReviewAdded }: AddReviewFormProps) {
  const { user, accessToken, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [selectedMarket, setSelectedMarket] = useState(editingReview?.market || 'Mercado de São José');
  const [selectedVendor, setSelectedVendor] = useState(editingReview?.vendor_id || '');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [rating, setRating] = useState(editingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(editingReview?.comment || '');
  const [photos, setPhotos] = useState<string[]>(editingReview?.photos || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch vendors when reviewType is vendor
  useEffect(() => {
    if (reviewType === 'vendor') {
      fetchVendors();
    }
  }, [reviewType]);

  // Update form when editingReview changes
  useEffect(() => {
    if (editingReview) {
      setRating(editingReview.rating);
      setComment(editingReview.comment);
      setPhotos(editingReview.photos || []);
      setSelectedMarket(editingReview.market);
      if (editingReview.vendor_id) {
        setSelectedVendor(editingReview.vendor_id);
      }
    } else {
      setRating(0);
      setComment('');
      setPhotos([]);
      setSelectedMarket('Mercado de São José');
      setSelectedVendor('');
    }
  }, [editingReview]);

  const fetchVendors = async () => {
    setLoadingVendors(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/vendors`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoadingVendors(false);
    }
  };

  const translations = {
    pt: {
      title: editingReview ? 'Editar Avaliação' : 'Adicionar Avaliação',
      loginRequired: 'Você precisa estar logado para avaliar',
      loginButton: 'Fazer Login',
      marketLabel: 'Mercado',
      marketPlaceholder: 'Selecione o mercado',
      vendorLabel: 'Vendedor',
      vendorPlaceholder: 'Selecione o vendedor',
      ratingLabel: 'Sua Avaliação',
      commentLabel: 'Seu Comentário',
      commentPlaceholderMarket: 'Compartilhe sua experiência visitando este mercado...',
      commentPlaceholderVendor: 'Compartilhe sua experiência com este vendedor...',
      photosLabel: 'Fotos (Opcional)',
      photoUrlPlaceholder: 'Cole a URL da foto',
      addPhotoButton: 'Adicionar',
      submitButton: editingReview ? 'Atualizar Avaliação' : 'Enviar Avaliação',
      submitting: editingReview ? 'Atualizando...' : 'Enviando...',
      success: editingReview ? 'Avaliação atualizada com sucesso!' : 'Avaliação enviada com sucesso!',
      errorRating: 'Por favor, selecione uma avaliação',
      errorComment: 'Por favor, escreva um comentário',
      errorVendor: 'Por favor, selecione um vendedor',
      errorServer: 'Erro ao enviar avaliação. Tente novamente.',
      loadingVendors: 'Carregando vendedores...',
    },
    en: {
      title: editingReview ? 'Edit Review' : 'Add Review',
      loginRequired: 'You need to be logged in to review',
      loginButton: 'Log In',
      marketLabel: 'Market',
      marketPlaceholder: 'Select the market',
      vendorLabel: 'Vendor',
      vendorPlaceholder: 'Select the vendor',
      ratingLabel: 'Your Rating',
      commentLabel: 'Your Comment',
      commentPlaceholderMarket: 'Share your experience visiting this market...',
      commentPlaceholderVendor: 'Share your experience with this vendor...',
      photosLabel: 'Photos (Optional)',
      photoUrlPlaceholder: 'Paste photo URL',
      addPhotoButton: 'Add',
      submitButton: editingReview ? 'Update Review' : 'Submit Review',
      submitting: editingReview ? 'Updating...' : 'Submitting...',
      success: editingReview ? 'Review updated successfully!' : 'Review submitted successfully!',
      errorRating: 'Please select a rating',
      errorComment: 'Please write a comment',
      errorVendor: 'Please select a vendor',
      errorServer: 'Error submitting review. Please try again.',
      loadingVendors: 'Loading vendors...',
    },
    es: {
      title: editingReview ? 'Editar Reseña' : 'Agregar Reseña',
      loginRequired: 'Debes iniciar sesión para evaluar',
      loginButton: 'Iniciar Sesión',
      marketLabel: 'Mercado',
      marketPlaceholder: 'Selecciona el mercado',
      vendorLabel: 'Vendedor',
      vendorPlaceholder: 'Selecciona el vendedor',
      ratingLabel: 'Tu Calificación',
      commentLabel: 'Tu Comentario',
      commentPlaceholderMarket: 'Comparte tu experiencia visitando este mercado...',
      commentPlaceholderVendor: 'Comparte tu experiencia con este vendedor...',
      photosLabel: 'Fotos (Opcional)',
      photoUrlPlaceholder: 'Pega la URL de la foto',
      addPhotoButton: 'Agregar',
      submitButton: editingReview ? 'Actualizar Reseña' : 'Enviar Reseña',
      submitting: editingReview ? 'Actualizando...' : 'Enviando...',
      success: editingReview ? '¡Reseña actualizada con éxito!' : '¡Reseña enviada con éxito!',
      errorRating: 'Por favor, selecciona una calificación',
      errorComment: 'Por favor, escribe un comentario',
      errorVendor: 'Por favor, selecciona un vendedor',
      errorServer: 'Error al enviar la reseña. Inténtalo de nuevo.',
      loadingVendors: 'Cargando vendedores...',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (rating === 0) {
      setError(translations[language].errorRating);
      return;
    }

    if (!comment.trim()) {
      setError(translations[language].errorComment);
      return;
    }

    if (reviewType === 'vendor' && !selectedVendor) {
      setError(translations[language].errorVendor);
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingReview
        ? `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/reviews/${editingReview.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/reviews`;

      const method = editingReview ? 'PUT' : 'POST';

      const body: any = {
        rating,
        comment,
        photos,
        review_type: reviewType,
      };

      if (reviewType === 'market') {
        body.market = selectedMarket;
      } else {
        body.vendor_id = selectedVendor;
        // Find vendor to get name and market
        const vendor = vendors.find(v => v.id === selectedVendor);
        if (vendor) {
          body.vendor_name = vendor.name;
          body.market = vendor.market;
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      toast.success(translations[language].success);
      
      if (!editingReview) {
        setRating(0);
        setComment('');
        setPhotos([]);
        setSelectedVendor('');
      }
      
      // Call the callback to refresh the reviews list
      onReviewAdded();

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(translations[language].errorServer);
      toast.error(translations[language].errorServer);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 text-center">
        <p className="mb-4">{translations[language].loginRequired}</p>
        <Button onClick={() => window.location.href = '#login'}>
          {translations[language].loginButton}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
      <h3 className="mb-4">{translations[language].title}</h3>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg">
          {translations[language].success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {reviewType === 'market' ? (
          <div>
            <label className="block mb-2">{translations[language].marketLabel}</label>
            <Select value={selectedMarket} onValueChange={setSelectedMarket} disabled={!!editingReview}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={translations[language].marketPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {MARKETS.map((market) => (
                  <SelectItem key={market.id} value={market.name}>
                    {market.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <label className="block mb-2">{translations[language].vendorLabel}</label>
            <Select value={selectedVendor} onValueChange={setSelectedVendor} disabled={loadingVendors || !!editingReview}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingVendors ? translations[language].loadingVendors : translations[language].vendorPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block mb-2">{translations[language].ratingLabel}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-orange-400 text-orange-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2">{translations[language].commentLabel}</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={reviewType === 'market' ? translations[language].commentPlaceholderMarket : translations[language].commentPlaceholderVendor}
            rows={4}
            className="w-full"
            disabled={isSubmitting}
          />
        </div>

        <MultiImageUpload
          label={translations[language].photosLabel}
          value={photos}
          onChange={setPhotos}
          maxImages={5}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700">
          {isSubmitting ? translations[language].submitting : translations[language].submitButton}
        </Button>
      </form>
    </div>
  );
}
