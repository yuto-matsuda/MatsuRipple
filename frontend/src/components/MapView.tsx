import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import type { Festival } from '../types/festival';

interface MapViewProps {
  festivals: Festival[];
  height?: string;
  activeFestival?: Festival | null;
  onSelectFestival?: (festival: Festival) => void;
}

export function MapView({ festivals, height = '500px', activeFestival, onSelectFestival }: MapViewProps) {
  const navigate = useNavigate();
  const withCoords = festivals.filter(
    (f) => f.location_lat !== null && f.location_lng !== null,
  );

  return (
    <MapContainer center={[36.2048, 138.2529]} zoom={6} style={{ height, width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {withCoords.map((festival) => {
        const isActive = activeFestival?.id === festival.id;
        return (
          <Marker
            key={festival.id}
            position={[festival.location_lat!, festival.location_lng!]}
          >
            <Popup>
              <div style={{ fontFamily: 'var(--font-body)' }}>
                {festival.region && (
                  <div style={{ fontSize: '11px', color: '#c85a2c', fontWeight: 600, marginBottom: '2px' }}>{festival.region}</div>
                )}
                <button
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isActive ? '#c85a2c' : '#1c2e17',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                  onClick={() => {
                    onSelectFestival?.(festival);
                    navigate(`/festivals/${festival.id}`);
                  }}
                >
                  {festival.name}
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
