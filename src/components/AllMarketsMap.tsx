import { useEffect, useRef } from 'react';

interface Market {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
}

interface AllMarketsMapProps {
  markets: Market[];
  onMarketSelect: (marketId: string) => void;
}

export function AllMarketsMap({ markets, onMarketSelect }: AllMarketsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Filter markets with coordinates
    const marketsWithCoords = markets.filter(m => m.lat && m.lng);
    
    if (marketsWithCoords.length === 0 || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Add Leaflet CSS dynamically
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Clear previous map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Calculate center point (Recife center)
        const centerLat = -8.05;
        const centerLng = -34.9;

        // Create map
        const map = L.map(mapRef.current).setView([centerLat, centerLng], 12);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Custom marker icon
        const createMarkerIcon = (color: string = '#f97316') => {
          return L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              ">
                <div style="
                  transform: rotate(45deg);
                  color: white;
                  font-size: 18px;
                ">📍</div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });
        };

        // Add markers for each market
        marketsWithCoords.forEach((market) => {
          const marker = L.marker([market.lat!, market.lng!], { 
            icon: createMarkerIcon() 
          }).addTo(map);
          
          // Add popup
          marker.bindPopup(`
            <div style="text-align: center; padding: 8px; min-width: 150px;">
              <strong style="font-size: 14px; display: block; margin-bottom: 6px;">${market.name}</strong>
              <span style="font-size: 11px; color: #666; display: block; margin-bottom: 8px;">${market.location}</span>
              <button 
                onclick="window.selectMarket('${market.id}')"
                style="
                  padding: 6px 12px;
                  background-color: #f97316;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 12px;
                  cursor: pointer;
                  font-weight: 500;
                "
                onmouseover="this.style.backgroundColor='#ea580c'"
                onmouseout="this.style.backgroundColor='#f97316'"
              >
                Ver Detalhes
              </button>
            </div>
          `);

          // Add click handler to marker
          marker.on('click', () => {
            onMarketSelect(market.id);
          });
        });

        // Fit bounds to show all markers
        if (marketsWithCoords.length > 0) {
          const bounds = L.latLngBounds(
            marketsWithCoords.map(m => [m.lat!, m.lng!] as [number, number])
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }

      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    // Expose function to window for popup button click
    (window as any).selectMarket = onMarketSelect;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      delete (window as any).selectMarket;
    };
  }, [markets, onMarketSelect]);

  // Filter markets with coordinates
  const marketsWithCoords = markets.filter(m => m.lat && m.lng);

  if (marketsWithCoords.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border-2 border-orange-200 flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum mercado com localização disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-orange-200 shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
