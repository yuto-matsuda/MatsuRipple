import { useNavigate } from 'react-router-dom';
import type { Festival } from '../types/festival';

interface FestivalCardProps {
  festival: Festival;
}

export function FestivalCard({ festival }: FestivalCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/festivals/${festival.id}`)}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{festival.name}</h3>
      {festival.region && (
        <p className="text-sm text-red-600 font-medium mb-1">{festival.region}</p>
      )}
      {festival.date && (
        <p className="text-sm text-gray-500">{festival.date}</p>
      )}
      {festival.description && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{festival.description}</p>
      )}
    </div>
  );
}
