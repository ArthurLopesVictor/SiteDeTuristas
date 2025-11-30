import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Camera, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ImageWithFallback } from './image/ImageWithFallback';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { AddReviewForm } from './AddReviewForm';
import { DatabaseStatus } from './DatabaseStatus';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Review {
  id: string;
  author: string;
  authorAvatar: string;
  rating: number;
  date: string;
  market: string;
  vendor_name?: string;
  review_type?: 'market' | 'vendor';
  comment: string;
  helpful: number;
  photos?: string[];
  user_id?: string;
}

interface TravelerTip {
  id: string;
  author: string;
  tip: string;
  market: string;
  likes: number;
}

interface ReviewsPageProps {
  reviews: Review[];
  tips: TravelerTip[];
  userPhotos: string[];
}

export function ReviewsPage({ reviews: initialReviews, tips, userPhotos }: ReviewsPageProps) {
  const { t } = useLanguage();
  const { accessToken, user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewType, setReviewType] = useState<'market' | 'vendor'>('market');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch reviews from backend
  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      
      // Use reviews from backend or combine with initial reviews
      const backendReviews = data.reviews || [];
      setReviews([...initialReviews, ...backendReviews]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Keep using initial reviews on error
      setReviews(initialReviews);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      toast.success(t('reviews.deleteSuccess'));
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(t('reviews.deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setReviewType(review.review_type || 'market');
    setShowAddReview(true);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Filter reviews by type
  const marketReviews = reviews.filter(r => !r.review_type || r.review_type === 'market');
  const vendorReviews = reviews.filter(r => r.review_type === 'vendor');

  // Filter reviews by market/vendor
  const filteredMarketReviews = marketReviews.filter(review => 
    selectedFilter === 'all' || review.market === selectedFilter
  );

  const filteredVendorReviews = vendorReviews;

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const renderReviewCard = (review: Review) => (
    <Card key={review.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.authorAvatar} />
              <AvatarFallback>{review.author[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="mb-1">{review.author}</h4>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-orange-500 text-orange-500'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary">{review.vendor_name || review.market}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{review.comment}</p>
        
        {review.photos && review.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {review.photos.map((photo, index) => (
              <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={photo}
                  alt={`Review photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ThumbsUp className="mr-2 h-4 w-4" />
            {t('reviews.helpful')} ({review.helpful})
          </Button>

          {/* Edit/Delete buttons (only for review owner) */}
          {user && review.user_id === user.id && (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleEditClick(review)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={deletingId === review.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('reviews.deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('reviews.deleteConfirm')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteReview(review.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t('reviews.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4">{t('reviews.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('reviews.subtitle')}
          </p>

          {/* Overall Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap mt-8">
            <div>
              <div className="flex items-center gap-2 justify-center mb-2">
                <span className="text-4xl">{averageRating.toFixed(1)}</span>
                <Star className="h-8 w-8 fill-orange-500 text-orange-500" />
              </div>
              <p className="text-sm text-muted-foreground">{reviews.length} avaliações</p>
            </div>
            <div>
              <div className="text-4xl mb-2">{userPhotos.length}</div>
              <p className="text-sm text-muted-foreground">Fotos</p>
            </div>
            <div>
              <div className="text-4xl mb-2">{tips.length}</div>
              <p className="text-sm text-muted-foreground">Dicas</p>
            </div>
          </div>
        </div>

        <DatabaseStatus section="reviews" />

        {/* Tabs for Review Type */}
        <Tabs value={reviewType} onValueChange={(value) => {
          setReviewType(value as 'market' | 'vendor');
          setEditingReview(null);
          setShowAddReview(false);
        }} className="w-full mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="market">{t('reviews.tabMarkets')}</TabsTrigger>
            <TabsTrigger value="vendor">{t('reviews.tabVendors')}</TabsTrigger>
          </TabsList>

          {/* Market Reviews Tab */}
          <TabsContent value="market">
            {/* Add Review Button */}
            <div className="mb-8 flex justify-center">
              <Button 
                onClick={() => {
                  setShowAddReview(!showAddReview);
                  setEditingReview(null);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                {showAddReview ? t('reviews.hideForm') : t('reviews.addReviewMarket')}
              </Button>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
              <div className="mb-12">
                <AddReviewForm 
                  reviewType="market"
                  editingReview={editingReview}
                  onReviewAdded={() => {
                    fetchReviews();
                    setShowAddReview(false);
                    setEditingReview(null);
                  }} 
                />
              </div>
            )}

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                {t('common.all')}
              </button>
              <button
                onClick={() => setSelectedFilter('Mercado de São José')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedFilter === 'Mercado de São José'
                    ? 'bg-orange-500 text-white'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                São José
              </button>
              <button
                onClick={() => setSelectedFilter('Mercado da Boa Vista')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedFilter === 'Mercado da Boa Vista'
                    ? 'bg-orange-500 text-white'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                Boa Vista
              </button>
              <button
                onClick={() => setSelectedFilter('Mercado de Casa Amarela')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedFilter === 'Mercado de Casa Amarela'
                    ? 'bg-orange-500 text-white'
                    : 'bg-accent hover:bg-accent/80'
                }`}
              >
                Casa Amarela
              </button>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {filteredMarketReviews.map(renderReviewCard)}
            </div>

            {filteredMarketReviews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('reviews.noMarketReviews')}</p>
              </div>
            )}
          </TabsContent>

          {/* Vendor Reviews Tab */}
          <TabsContent value="vendor">
            {/* Add Review Button */}
            <div className="mb-8 flex justify-center">
              <Button 
                onClick={() => {
                  setShowAddReview(!showAddReview);
                  setEditingReview(null);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                {showAddReview ? t('reviews.hideForm') : t('reviews.addReviewVendor')}
              </Button>
            </div>

            {/* Add Review Form */}
            {showAddReview && (
              <div className="mb-12">
                <AddReviewForm 
                  reviewType="vendor"
                  editingReview={editingReview}
                  onReviewAdded={() => {
                    fetchReviews();
                    setShowAddReview(false);
                    setEditingReview(null);
                  }} 
                />
              </div>
            )}

            {/* Vendor Reviews Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {filteredVendorReviews.map(renderReviewCard)}
            </div>

            {filteredVendorReviews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('reviews.noVendorReviews')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Traveler Tips Section */}
        <div className="mt-16">
          <h2 className="mb-6 text-center">{t('reviews.travelerTips')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <Card key={tip.id} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <p className="text-sm mb-4">{tip.tip}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>— {tip.author}</span>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {tip.likes}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Photos Gallery */}
        <div className="mt-16">
          <h2 className="mb-6 text-center">{t('reviews.userPhotos')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userPhotos.map((photo, index) => (
              <div key={index} className="relative h-48 rounded-lg overflow-hidden group cursor-pointer">
                <ImageWithFallback
                  src={photo}
                  alt={`User photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
