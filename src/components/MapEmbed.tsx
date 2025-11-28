import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface MapEmbedProps {
  location: string;
  marketName: string;
  lat?: number;
  lng?: number;
}

export function MapEmbed({ location, marketName, lat, lng }: MapEmbedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Only load map if coordinates are provided
    if (!lat || !lng || !mapRef.current) return;

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

        // Create map
        const map = L.map(mapRef.current).setView([lat, lng], 15);
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Custom marker icon with orange color
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: #f97316;
              width: 40px;
              height: 40px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-size: 20px;
              ">📍</div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        // Add marker
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        
        // Add popup
        marker.bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <strong style="font-size: 14px;">${marketName}</strong><br/>
            <span style="font-size: 12px; color: #666;">${location}</span><br/>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="
                display: inline-block;
                margin-top: 8px;
                padding: 6px 12px;
                background-color: #f97316;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-size: 12px;
              "
            >
              Abrir no Google Maps
            </a>
          </div>
        `).openPopup();

      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [lat, lng, marketName, location]);

  // If no coordinates, show fallback
  if (!lat || !lng) {
    return (
      <div className="w-full h-80 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border-2 border-orange-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h4 className="mb-2">{marketName}</h4>
            <p className="text-sm text-muted-foreground mb-4">{location}</p>
            <div className="space-y-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location + ', Recife, Brazil')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Abrir no Google Maps
              </a>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="border border-orange-300" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 rounded-lg overflow-hidden border-2 border-orange-200 shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
