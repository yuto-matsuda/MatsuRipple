import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import type { Festival } from '../types/festival';

interface FestivalCardProps {
  festival: Festival;
  isActive?: boolean;
  onClick?: (festival: Festival) => void;
}

export function FestivalCard({ festival, isActive = false, onClick }: FestivalCardProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(festival);
    } else {
      navigate(`/festivals/${festival.id}`);
    }
  };

  const elevated = hovered || isActive;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isActive ? '#fdf6f2' : 'white',
        border: '1.5px solid transparent',
        borderColor: isActive ? '#e8a87c' : hovered ? '#c8d8be' : '#e4eddf',
        borderLeft: isActive ? '4px solid #c85a2c' : hovered ? '4px solid #dca880' : '4px solid transparent',
        borderRadius: '12px',
        padding: '12px 14px',
        cursor: 'pointer',
        boxShadow: elevated ? '0 6px 20px rgba(28,46,23,0.13)' : '0 1px 4px rgba(28,46,23,0.07)',
        transform: hovered && !isActive ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.18s ease',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {festival.region && (
          <div style={{
            display: 'inline-block',
            fontSize: '10px', fontWeight: 700,
            color: '#c85a2c', background: '#fff0e8',
            borderRadius: '4px', padding: '1px 6px',
            marginBottom: '5px', letterSpacing: '0.05em',
            fontFamily: 'var(--font-body)',
          }}>
            {festival.region}
          </div>
        )}

        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700,
          color: '#1c2e17', marginBottom: '5px', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {festival.name}
        </div>

        {festival.start_datetime && (
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#c85a2c', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={11} />
            {festival.start_datetime.replace('T', ' ').slice(0, 16)}
          </div>
        )}

        {festival.venue && (
          <div style={{ fontSize: '11px', color: '#7a9470', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={11} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {festival.venue}
            </span>
          </div>
        )}
      </div>

      {festival.thumbnail_url && (
        <img
          src={festival.thumbnail_url}
          alt={festival.name}
          style={{
            width: '56px', height: '56px', objectFit: 'cover',
            borderRadius: '8px', flexShrink: 0, border: '1px solid #e4eddf',
          }}
        />
      )}
    </div>
  );
}
