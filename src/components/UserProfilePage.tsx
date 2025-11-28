import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Heart, Mail, Lock, Save, Loader2, Trash2, Store, Users, MapPin, Calendar, Sparkles, Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface Favorites {
  markets: Array<{ id: string; name: string; added_at: string }>;
  vendors: Array<{ id: string; name: string; added_at: string }>;
}

export function UserProfilePage({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { user, accessToken, logout, updateUser, refreshSession } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [favorites, setFavorites] = useState<Favorites>({ markets: [], vendors: [] });
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'market' | 'vendor'; id: string } | null>(null);
  
  // Profile form state
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      loadFavorites();
    }
  }, [user]);

  // Atualiza os campos do formulário quando o usuário mudar
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user?.name, user?.email]);

  const loadFavorites = async () => {
    if (!accessToken) return;
    
    setFavoritesLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast.error(t('profile.passwordMismatch'));
      return;
    }
    
    if (!name.trim()) {
      toast.error(t('profile.nameRequired'));
      return;
    }

    setLoading(true);

    try {
      const updates: any = { name };
      
      if (email !== user?.email) {
        updates.email = email;
      }
      
      if (password) {
        updates.password = password;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t('profile.updateError'));
        return;
      }

      // Atualiza os dados do usuário imediatamente na interface
      if (name !== user?.name) {
        updateUser({ name });
      }
      
      if (email !== user?.email) {
        updateUser({ email });
      }

      // Mostra feedback de sucesso
      setUpdateSuccess(true);
      toast.success(t('profile.updateSuccess'));
      setPassword('');
      setConfirmPassword('');
      
      // Remove o feedback de sucesso após 3 segundos
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // If email changed, user needs to re-login after a moment
      if (email !== user?.email) {
        toast.info(t('profile.reloginRequired'));
        // Aguarda um momento para o usuário ver a atualização antes de fazer logout
        setTimeout(() => {
          logout();
          onNavigate('login');
        }, 1500);
      } else {
        // Se não mudou o email, apenas atualiza a sessão em background
        refreshSession();
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (type: 'market' | 'vendor', id: string) => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);

    if (!accessToken) {
      console.error('[UserProfile] No access token available for removing favorite');
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    console.log(`[UserProfile] Removing favorite - Type: ${type}, ID: ${id}`);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/favorites/${type}/${id}`;
      console.log(`[UserProfile] DELETE request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log(`[UserProfile] Remove favorite response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('[UserProfile] Favorite removed successfully, new data:', data);
        setFavorites(data.favorites);
        toast.success(t('profile.favoriteRemoved'));
      } else {
        const errorText = await response.text();
        console.error('[UserProfile] Failed to remove favorite:', response.status, errorText);
        if (response.status === 403) {
          toast.error('Erro 403: Acesso negado. Verifique se a edge function está deployada corretamente.');
        } else if (response.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
        } else {
          toast.error(t('profile.removeError'));
        }
      }
    } catch (error) {
      console.error('[UserProfile] Error removing favorite:', error);
      toast.error(t('profile.removeError'));
    }
  };

  const openDeleteDialog = (type: 'market' | 'vendor', id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-orange-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{t('profile.loginRequired')}</p>
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-amber-900 mb-2">{t('profile.title')}</h1>
          <p className="text-muted-foreground">{t('profile.subtitle')}</p>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('profile.personalInfo')}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {t('profile.favorites')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card className={updateSuccess ? 'border-green-300 bg-green-50/30' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('profile.editProfile')}</CardTitle>
                    <CardDescription>{t('profile.editDescription')}</CardDescription>
                  </div>
                  {updateSuccess && (
                    <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-right">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm">Atualizado!</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('profile.name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        placeholder={t('profile.namePlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        placeholder={t('profile.emailPlaceholder')}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-6">
                    <h3 className="mb-4 text-muted-foreground">{t('profile.changePassword')}</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">{t('profile.newPassword')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            placeholder={t('profile.passwordPlaceholder')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10"
                            placeholder={t('profile.confirmPasswordPlaceholder')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || updateSuccess} 
                    className={`w-full transition-all ${updateSuccess ? 'bg-green-600 hover:bg-green-600' : ''}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('profile.updating')}
                      </>
                    ) : updateSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Salvo!
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {t('profile.saveChanges')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="space-y-8">
              {/* Header com estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500 rounded-xl shadow-md">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-amber-700">{t('profile.favoriteMarkets')}</p>
                        <p className="text-3xl text-amber-900">{favorites.markets.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-500 rounded-xl shadow-md">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-rose-700">{t('profile.favoriteVendors')}</p>
                        <p className="text-3xl text-rose-900">{favorites.vendors.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mercados Favoritos */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-amber-900">{t('profile.favoriteMarkets')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {favorites.markets.length === 0
                        ? t('profile.noFavoriteMarkets')
                        : t('profile.favoriteMarketsCount', { count: favorites.markets.length })}
                    </p>
                  </div>
                </div>

                {favoritesLoading ? (
                  <Card className="border-amber-200">
                    <CardContent className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                    </CardContent>
                  </Card>
                ) : favorites.markets.length === 0 ? (
                  <Card className="border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                    <CardContent className="text-center py-12">
                      <div className="inline-flex p-4 bg-amber-100 rounded-full mb-4">
                        <Store className="h-8 w-8 text-amber-600" />
                      </div>
                      <p className="text-muted-foreground mb-2">{t('profile.noFavoriteMarkets')}</p>
                      <p className="text-sm text-muted-foreground">
                        Explore os mercados e adicione seus favoritos!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.markets.map((market) => (
                      <Card
                        key={market.id}
                        className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-amber-200 bg-gradient-to-br from-white to-amber-50/30 overflow-hidden relative"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-300/20 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500" />
                        <CardContent className="pt-6 relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                <MapPin className="h-5 w-5 text-amber-600" />
                              </div>
                              <div>
                                <h3 className="text-amber-900 group-hover:text-amber-700 transition-colors">
                                  {market.name}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(market.added_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog('market', market.id)}
                              className="hover:bg-red-100 hover:text-red-600 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            <span className="text-xs text-muted-foreground">Favoritado</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Vendedores Favoritos */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-rose-900">{t('profile.favoriteVendors')}</h2>
                    <p className="text-sm text-muted-foreground">
                      {favorites.vendors.length === 0
                        ? t('profile.noFavoriteVendors')
                        : t('profile.favoriteVendorsCount', { count: favorites.vendors.length })}
                    </p>
                  </div>
                </div>

                {favoritesLoading ? (
                  <Card className="border-rose-200">
                    <CardContent className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                    </CardContent>
                  </Card>
                ) : favorites.vendors.length === 0 ? (
                  <Card className="border-2 border-dashed border-rose-200 bg-gradient-to-br from-rose-50/50 to-pink-50/50">
                    <CardContent className="text-center py-12">
                      <div className="inline-flex p-4 bg-rose-100 rounded-full mb-4">
                        <Users className="h-8 w-8 text-rose-600" />
                      </div>
                      <p className="text-muted-foreground mb-2">{t('profile.noFavoriteVendors')}</p>
                      <p className="text-sm text-muted-foreground">
                        Conheça os vendedores e salve seus favoritos!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.vendors.map((vendor) => (
                      <Card
                        key={vendor.id}
                        className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-rose-200 bg-gradient-to-br from-white to-rose-50/30 overflow-hidden relative"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/20 to-pink-300/20 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500" />
                        <CardContent className="pt-6 relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
                                <Star className="h-5 w-5 text-rose-600" />
                              </div>
                              <div>
                                <h3 className="text-rose-900 group-hover:text-rose-700 transition-colors">
                                  {vendor.name}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(vendor.added_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog('vendor', vendor.id)}
                              className="hover:bg-red-100 hover:text-red-600 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            <span className="text-xs text-muted-foreground">Favoritado</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Call to action quando tem poucos favoritos */}
              {!favoritesLoading && (favorites.markets.length + favorites.vendors.length) < 3 && (
                <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-orange-100 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Sparkles className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-amber-900 mb-2">✨ Descubra mais!</h3>
                        <p className="text-sm text-amber-800 mb-4">
                          Adicione mais mercados e vendedores aos seus favoritos para uma experiência personalizada.
                        </p>
                        <Button
                          onClick={() => onNavigate('search')}
                          className="bg-amber-600 hover:bg-amber-700"
                          size="sm"
                        >
                          Explorar agora
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profile.removeFavoriteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('profile.removeFavoriteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleRemoveFavorite(itemToDelete.type, itemToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
