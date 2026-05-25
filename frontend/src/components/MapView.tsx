import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import * as L from 'leaflet';
import type { Festival } from '../types/festival';

interface MapViewProps {
  festivals: Festival[];
  height?: string;
  activeFestival?: Festival | null;
  focusKey?: number;
  onSelectFestival?: (festival: Festival) => void;
}

function MapController({
  activeFestival,
  focusKey,
  markerRefs,
}: {
  activeFestival: Festival | null | undefined;
  focusKey: number | undefined;
  markerRefs: { current: Map<number, L.Marker> };
}) {
  const map = useMap();

  useEffect(() => {
    if (!activeFestival) return;
    if (activeFestival.location_lat == null || activeFestival.location_lng == null) return;

    const openPopup = () => {
      markerRefs.current.get(activeFestival.id)?.openPopup();
    };
    map.flyTo(
      [activeFestival.location_lat, activeFestival.location_lng],
      Math.max(map.getZoom(), 12),
      { duration: 0.8 },
    );
    map.once('moveend', openPopup);
    return () => { map.off('moveend', openPopup); };
  }, [activeFestival, focusKey, map, markerRefs]);

  return null;
}

export function MapView({ festivals, height = '500px', activeFestival, focusKey, onSelectFestival }: MapViewProps) {
  const navigate = useNavigate();
  const markerRefs = useRef<Map<number, L.Marker>>(new Map());
  const withCoords = festivals.filter(
    (f) => f.location_lat !== null && f.location_lng !== null,
  );

  return (
    <MapContainer center={[36.2048, 138.2529]} zoom={6} style={{ height, width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapController activeFestival={activeFestival} focusKey={focusKey} markerRefs={markerRefs} />
      {withCoords.map((festival) => (
        <Marker
          key={festival.id}
          position={[festival.location_lat!, festival.location_lng!]}
          ref={(marker) => {
            if (marker) markerRefs.current.set(festival.id, marker);
            else markerRefs.current.delete(festival.id);
          }}
          eventHandlers={{
            click: () => onSelectFestival?.(festival),
          }}
        >
          <Popup>
            <div style={{ fontFamily: 'var(--font-body)', minWidth: '180px' }}>
              {festival.thumbnail_url && (
                <img
                  src={festival.thumbnail_url}
                  alt={festival.name}
                  style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block', borderRadius: '4px', marginBottom: '8px' }}
                />
              )}
              {festival.region && (
                <div style={{ fontSize: '11px', color: '#c85a2c', fontWeight: 600, marginBottom: '2px' }}>{festival.region}</div>
              )}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1c2e17', marginBottom: '4px' }}>
                {festival.name}
              </div>
              {festival.start_datetime && (
                <div style={{ fontSize: '12px', color: '#7a9470', marginBottom: '2px' }}>{festival.start_datetime.replace('T', ' ').slice(0, 16)}</div>
              )}
              {festival.venue && (
                <div style={{ fontSize: '12px', color: '#7a9470', marginBottom: '8px' }}>{festival.venue}</div>
              )}
              <button
                onClick={() => navigate(`/festivals/${festival.id}`)}
                style={{
                  background: '#c85a2c', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '7px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                }}
              >
                詳細を見る →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
