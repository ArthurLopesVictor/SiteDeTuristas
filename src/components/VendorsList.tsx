import { useState, useEffect } from 'react';
import { Search, MapPin, Award, Trash2, Edit } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ImageWithFallback } from './image/ImageWithFallback';
import { VendorRegistrationForm } from './VendorRegistrationForm';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface Vendor {
  id: string;
  name: string;
  description: string;
  specialty: string;
  products: string[];
  location: string;
  market: string;
  image: string;
  badges?: string[];
  user_id?: string;
  created_at?: string;
}

interface VendorsListProps {
  vendors: Vendor[];
  selectedVendorName?: string | null;
}

export function VendorsList({ vendors: mockVendors, selectedVendorName }: VendorsListProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dbVendors, setDbVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  // Fetch vendors from API
  useEffect(() => {
    fetchVendors();

    // Removed the polling interval - vendors will be fetched on demand
  }, []);

  const fetchVendors = async () => {
    try {
      const { publicAnonKey, projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/vendors`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform API data to match component format
        const transformedVendors = data.vendors.map((v: any) => ({
          id: v.id,
          name: v.name,
          description: v.description || '',
          specialty: v.specialty,
          products: v.products || [],
          location: v.location || '',
          market: v.market_name || '',
          image: v.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${v.name}`,
          badges: v.badges || [],
          user_id: v.created_by_user_id,
          created_at: v.created_at,
        }));
        setDbVendors(transformedVendors);
      } else {
        console.error('Failed to fetch vendors from API');
        setDbVendors([]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setDbVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    setDeletingId(vendorId);
    try {
      if (!user) {
        toast.error('Você precisa estar logado para deletar um vendedor');
        return;
      }

      const { projectId } = await import('../utils/supabase/info');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/vendors/${vendorId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar vendedor');
      }

      toast.success(t('vendors.deleteSuccess'));
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error(t('vendors.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  // Combine mock vendors with database vendors
  const allVendors = [...mockVendors, ...dbVendors];

  // Extract unique product categories
  const categories = ['all', ...new Set(allVendors.flatMap(v => v.products))];

  // Filter vendors
  const filteredVendors = allVendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.products.includes(selectedCategory);
    const matchesSelected = !selectedVendorName || vendor.name === selectedVendorName;
    return matchesSearch && matchesCategory && matchesSelected;
  });

  const handleEditClick = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setActiveTab('register');
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4">{t('vendors.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('vendors.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          if (value === "list") {
            setEditingVendor(null);
          }
        }} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="list">{t('vendors.tabList')}</TabsTrigger>
            <TabsTrigger value="register">{editingVendor ? t('vendors.tabEdit') : t('vendors.tabRegister')}</TabsTrigger>
          </TabsList>

          {/* Vendors List Tab */}
          <TabsContent value="list">
            {/* Search and Filter */}
            <div className="mb-8 space-y-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('common.searchVendors')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-accent hover:bg-accent/80'
                    }`}
                  >
                    {category === 'all' ? t('common.all') : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('auth.loading')}</p>
              </div>
            )}

            {/* Vendors Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative h-56">
                      <ImageWithFallback
                        src={vendor.image}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {vendor.created_at && (
                          <div className="bg-green-500/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {t('dynamic.new')}
                          </div>
                        )}
                        {/* Authenticity Badges */}
                        {vendor.badges && vendor.badges.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {vendor.badges.map((badge, index) => (
                              <div
                                key={index}
                                className="bg-orange-500/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white"
                              >
                                {badge}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="mb-2">{vendor.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {vendor.description || (vendor as any).story}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <p className="text-sm mb-2">{t('vendors.specialty')}:</p>
                          <p className="text-orange-600">{vendor.specialty}</p>
                        </div>
                        
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-muted-foreground">{vendor.market}</p>
                            <p className="text-xs text-muted-foreground">{vendor.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm mb-2">{t('dynamic.products')}:</p>
                        <div className="flex flex-wrap gap-2">
                          {vendor.products.map((product, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Edit and Delete Buttons (only for vendor's own profile) */}
                      {user && vendor.user_id === user.id && (
                        <div className="border-t mt-4 pt-4 space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleEditClick(vendor)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {t('vendors.editProfile')}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full"
                                disabled={deletingId === vendor.id}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('vendors.deleteProfile')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('vendors.deleteProfile')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('vendors.deleteConfirm')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteVendor(vendor.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Apagar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && filteredVendors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum vendedor encontrado com os filtros selecionados.</p>
              </div>
            )}
          </TabsContent>

          {/* Vendor Registration Tab */}
          <TabsContent value="register">
            <VendorRegistrationForm 
              editingVendor={editingVendor}
              onEditComplete={() => {
                setEditingVendor(null);
                setActiveTab('list');
                fetchVendors();
              }}
              onCreateComplete={() => {
                // Atualiza a lista imediatamente após criar um vendedor
                fetchVendors();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}