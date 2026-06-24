'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapPoint {
  lat: number
  lng: number
  address: string
  risk_level: string
  risk_score: number
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#10b981',
}

export default function AdminMap({ points }: { points: MapPoint[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Center on Mauritius
    const map = L.map(mapRef.current, {
      center: [-20.2, 57.5],
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map)

    mapInstanceRef.current = map

    // Add markers
    for (const pt of points) {
      const color = RISK_COLORS[pt.risk_level] || '#6b7280'

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 14px;
          height: 14px;
          background: ${color};
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          box-shadow: 0 0 8px ${color}80;
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      })

      L.marker([pt.lat, pt.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: system-ui; font-size: 12px; color: #27272a; min-width: 160px;">
            <strong style="color: ${color}; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em;">${pt.risk_level} Risk</strong>
            <div style="margin-top: 4px; font-size: 11px; color: #52525b;">Score: <strong>${pt.risk_score}/100</strong></div>
            <div style="margin-top: 2px; font-size: 11px; color: #71717a;">${pt.address}</div>
          </div>`
        )
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [points])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
