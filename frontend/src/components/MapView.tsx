import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import type { Festival } from '../types/festival';

interface MapViewProps {
  festivals: Festival[];
  height?: string;
}

export function MapView({ festivals, height = '500px' }: MapViewProps) {
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
      {withCoords.map((festival) => (
        <Marker
          key={festival.id}
          position={[festival.location_lat!, festival.location_lng!]}
        >
          <Popup>
            <button
              className="text-red-700 font-semibold hover:underline text-sm"
              onClick={() => navigate(`/festivals/${festival.id}`)}
            >
              {festival.name}
            </button>
            {festival.region && <p className="text-xs text-gray-500 mt-0.5">{festival.region}</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
