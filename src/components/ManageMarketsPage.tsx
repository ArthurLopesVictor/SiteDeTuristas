import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Store, Edit, Trash2, Loader2, MapPin, Clock, Phone, Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';
import { MultiImageUpload } from './MultiImageUpload';

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

export function ManageMarketsPage() {
  const { user, accessToken } = useAuth();
  const { t } = useLanguage();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [deletingMarket, setDeletingMarket] = useState<Market | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    hours: '',
    photos: [] as string[],
  });

  useEffect(() => {
    if (user) {
      loadMarkets();
    }
  }, [user]);

  const loadMarkets = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets/my`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMarkets(data.markets || []);
      } else {
        toast.error(t('manageMarkets.loadError'));
      }
    } catch (error) {
      console.error('[ManageMarketsPage] Error loading markets:', error);
      toast.error(t('manageMarkets.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (market: Market) => {
    setEditingMarket(market);
    setFormData({
      name: market.name,
      description: market.description,
      address: market.address,
      phone: market.phone,
      hours: market.hours,
      photos: market.photos,
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingMarket(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      phone: '',
      hours: '',
      photos: [],
    });
  };

  const handleSaveMarket = async () => {
    if (!accessToken || !editingMarket) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error(t('manageMarkets.nameRequired'));
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t('manageMarkets.descriptionRequired'));
      return;
    }
    if (!formData.address.trim()) {
      toast.error(t('manageMarkets.addressRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets/${editingMarket.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success(t('manageMarkets.updateSuccess'));
        closeEditDialog();
        loadMarkets();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('manageMarkets.updateError'));
      }
    } catch (error) {
      console.error('[ManageMarketsPage] Error updating market:', error);
      toast.error(t('manageMarkets.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMarket = async () => {
    if (!accessToken || !deletingMarket) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets/${deletingMarket.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        toast.success(t('manageMarkets.deleteSuccess'));
        setIsDeleteDialogOpen(false);
        setDeletingMarket(null);
        loadMarkets();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('manageMarkets.deleteError'));
      }
    } catch (error) {
      console.error('[ManageMarketsPage] Error deleting market:', error);
      toast.error(t('manageMarkets.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (market: Market) => {
    setDeletingMarket(market);
    setIsDeleteDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('manageMarkets.loginRequired')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-amber-900 mb-2">{t('manageMarkets.title')}</h1>
          <p className="text-muted-foreground">{t('manageMarkets.subtitle')}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : markets.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{t('manageMarkets.noMarkets')}</p>
              <Button onClick={() => window.location.hash = '#/register-market'}>
                <Plus className="h-4 w-4 mr-2" />
                {t('manageMarkets.createFirst')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {markets.map((market) => (
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
                    <Badge variant={market.is_verified ? 'default' : 'secondary'}>
                      {market.is_verified ? t('manageMarkets.verified') : t('manageMarkets.pending')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground line-clamp-2">{market.address}</span>
                  </div>
                  {market.hours && (
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{market.hours}</span>
                    </div>
                  )}
                  {market.phone && (
                    <div className="flex items-start gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{market.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {market.photos.length} {t('manageMarkets.photos')}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(market)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('manageMarkets.edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(market)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('manageMarkets.delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('manageMarkets.editTitle')}</DialogTitle>
            <DialogDescription>{t('manageMarkets.editDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm">{t('manageMarkets.nameLabel')}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('manageMarkets.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">{t('manageMarkets.descriptionLabel')}</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('manageMarkets.descriptionPlaceholder')}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">{t('manageMarkets.addressLabel')}</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('manageMarkets.addressPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">{t('manageMarkets.phoneLabel')}</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('manageMarkets.phonePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">{t('manageMarkets.hoursLabel')}</label>
              <Input
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder={t('manageMarkets.hoursPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">{t('manageMarkets.photosLabel')}</label>
              <MultiImageUpload
                images={formData.photos}
                onImagesChange={(photos) => setFormData({ ...formData, photos })}
                maxImages={10}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeEditDialog} disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveMarket} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('manageMarkets.saving')}
                </>
              ) : (
                t('manageMarkets.save')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('manageMarkets.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('manageMarkets.deleteConfirm').replace('{name}', deletingMarket?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMarket}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('manageMarkets.deleting')}
                </>
              ) : (
                t('manageMarkets.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
