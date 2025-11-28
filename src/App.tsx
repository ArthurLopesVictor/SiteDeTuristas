import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { AllMarketsPage } from './components/AllMarketsPage';
import { MarketDetailPage } from './components/MarketDetailPage';
import { VendorsList } from './components/VendorsList';
import { ItinerariesPage } from './components/ItinerariesPage';
import { ReviewsPage } from './components/ReviewsPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { UserProfilePage } from './components/UserProfilePage';
import { MarketRegistrationPage } from './components/MarketRegistrationPage';
import { SearchPage } from './components/SearchPage';
import { ManageMarketsPage } from './components/ManageMarketsPage';
import { projectId } from './utils/supabase/info';
import { 
  getTranslatedMarketData, 
  getTranslatedVendorsData, 
  getTranslatedItinerariesData,
  getTranslatedReviewsData,
  getTranslatedTipsData 
} from './utils/translatedData';

const userPhotosData = [
  'https://images.unsplash.com/photo-1706097715393-45455755b017?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBzdHJlZXQlMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjAwMjc0MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1612287193938-850d948fa92a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZydWl0cyUyMG1hcmtldHxlbnwxfHx8fDE3NjAwMTMxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1716876995651-1ff85b65a6d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBoYW5kaWNyYWZ0JTIwYXJ0aXNhbnxlbnwxfHx8fDE3NjAwMjc0MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1616140799124-8d582de4bbb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGZvb2QlMjBtYXJrZXR8ZW58MXx8fHwxNzYwMDI3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1657127990644-ee0c84587f60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpZmUlMjBicmF6aWwlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzYwMDI3NDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1593260085573-8c27e72cdd79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWNpZmUlMjBicmF6aWwlMjBtYXJrZXR8ZW58MXx8fHwxNzYwMDI3NDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1597409244351-79ff2d5da5ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZW5kb3IlMjBtYXJrZXQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjAwMzE5NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  'https://images.unsplash.com/photo-1651367520264-cd04fda1605c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXQlMjBzdGFsbCUyMG93bmVyJTIwYnJhemlsfGVufDF8fHx8MTc2MDAzMTk1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
];

function AppContent() {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState('home');
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [selectedVendorName, setSelectedVendorName] = useState<string | null>(null);

  // Get translated data
  const marketsData = getTranslatedMarketData(t);
  const vendorsData = getTranslatedVendorsData(t);
  const itinerariesData = getTranslatedItinerariesData(t);
  const reviewsData = getTranslatedReviewsData(t);
  const tipsData = getTranslatedTipsData(t);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setSelectedMarket(null);
    setSelectedVendorName(null);
    window.scrollTo(0, 0);
  };

  const handleMarketSelect = async (marketId: string) => {
    // First, try to find in static markets data
    const staticMarket = marketsData.find(m => m.id === marketId);
    if (staticMarket) {
      setSelectedMarket(staticMarket);
      setCurrentView('market-detail');
      window.scrollTo(0, 0);
      return;
    }

    // If not found, fetch from API (dynamic market)
    try {
      const { publicAnonKey } = await import('./utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a5c257ac/markets/${marketId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        console.error(`Market not found: ${marketId}, status: ${response.status}`);
        // Navigate back to markets page if not found
        setCurrentView('markets');
        return;
      }

      const result = await response.json();
      const data = result.market;

      if (data) {
        // Transform database market to expected format
        const transformedMarket = {
          id: data.id,
          name: data.name,
          description: data.description,
          location: data.address,
          hours: data.hours || t('common.hours'),
          image: data.photos && data.photos.length > 0 ? data.photos[0] : '',
          highlights: [],
          history: data.description, // Use description as history for DB markets
          products: [],
          gallery: data.photos || [],
          vendors: [],
          lat: undefined, // Dynamic markets don't have coordinates yet
          lng: undefined,
        };
        
        setSelectedMarket(transformedMarket);
        setCurrentView('market-detail');
        window.scrollTo(0, 0);
      } else {
        console.error('Market data is empty');
        setCurrentView('markets');
      }
    } catch (error) {
      console.error('Error fetching market:', error);
      // Navigate back to markets page on error
      setCurrentView('markets');
    }
  };

  const handleVendorSelect = (vendorName: string) => {
    setSelectedVendorName(vendorName);
    setCurrentView('vendors');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Navigation currentView={currentView} onNavigate={handleNavigate} />
      
      {currentView === 'home' && (
        <HomePage markets={marketsData} onMarketSelect={handleMarketSelect} />
      )}
      
      {currentView === 'markets' && (
        <AllMarketsPage onMarketSelect={handleMarketSelect} />
      )}
      
      {currentView === 'market-detail' && selectedMarket && (
        <MarketDetailPage 
          market={selectedMarket} 
          onBack={() => handleNavigate('markets')}
          onVendorClick={handleVendorSelect}
        />
      )}
      
      {currentView === 'vendors' && (
        <VendorsList 
          vendors={vendorsData}
          selectedVendorName={selectedVendorName}
        />
      )}
      
      {currentView === 'itineraries' && (
        <ItinerariesPage itineraries={itinerariesData} />
      )}
      
      {currentView === 'reviews' && (
        <ReviewsPage 
          reviews={reviewsData} 
          tips={tipsData}
          userPhotos={userPhotosData}
        />
      )}

      {currentView === 'login' && (
        <LoginPage onNavigate={handleNavigate} />
      )}

      {currentView === 'signup' && (
        <SignupPage onNavigate={handleNavigate} />
      )}

      {currentView === 'profile' && (
        <UserProfilePage onNavigate={handleNavigate} />
      )}

      {currentView === 'register-market' && (
        <MarketRegistrationPage onNavigate={handleNavigate} />
      )}

      {currentView === 'search' && (
        <SearchPage />
      )}

      {currentView === 'manage-markets' && (
        <ManageMarketsPage />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}