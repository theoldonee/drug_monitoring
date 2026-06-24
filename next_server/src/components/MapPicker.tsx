'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Next.js Leaflet default marker icon paths using copied assets in /public/leaflet/
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  selectedLat?: number | null;
  selectedLng?: number | null;
}

export default function MapPicker({ onLocationSelect, selectedLat, selectedLng }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center of Mauritius
    const initialLat = selectedLat ?? -20.2759;
    const initialLng = selectedLng ?? 57.5703;
    const initialZoom = selectedLat && selectedLng ? 14 : 11;

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    // Place initial marker if coords are provided
    if (selectedLat && selectedLng) {
      const marker = L.marker([selectedLat, selectedLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        await handlePositionChange(position.lat, position.lng);
      });
    }

    // Handle clicks to place/move the pin
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      await handlePositionChange(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const handlePositionChange = async (lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;

    setLoadingAddress(true);

    // Update marker position
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        await handlePositionChange(position.lat, position.lng);
      });
    }

    // Call Nominatim API for reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'SafeGuard-MU-Incident-Reporter',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onLocationSelect(lat, lng, address);
      } else {
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapContainerRef}
        style={{
          height: '350px',
          width: '100%',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1,
        }}
      />
      {loadingAddress && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#18181b',
            color: '#a1a1aa',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 10,
          }}
        >
          Fetching address...
        </div>
      )}
    </div>
  );
}
