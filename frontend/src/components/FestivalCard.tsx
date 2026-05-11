import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isActive ? '#edf3e7' : 'white',
        border: `1.5px solid ${isActive ? '#9ab88e' : '#c8d8be'}`,
        borderLeft: isActive ? '3px solid #c85a2c' : '1.5px solid #c8d8be',
        borderRadius: '10px',
        padding: '12px 14px',
        cursor: 'pointer',
        boxShadow: hovered || isActive ? '0 4px 16px rgba(28,46,23,0.12)' : '0 1px 4px rgba(28,46,23,0.08)',
        transition: 'all 0.2s',
      }}
    >
      {festival.region && (
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#c85a2c', marginBottom: '2px', letterSpacing: '0.04em' }}>
          {festival.region}
        </div>
      )}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: '#1c2e17', marginBottom: '3px', lineHeight: 1.3 }}>
        {festival.name}
      </div>
      {festival.start_datetime && (
        <div style={{ fontSize: '11px', color: '#7a9470', marginBottom: '2px' }}>
          {festival.start_datetime.replace('T', ' ').slice(0, 16)}
        </div>
      )}
      {festival.venue && (
        <div style={{ fontSize: '11px', color: '#7a9470', marginBottom: '6px' }}>📍 {festival.venue}</div>
      )}
      {festival.description && (
        <div style={{ fontSize: '12px', color: '#4a6840', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
          {festival.description}
        </div>
      )}
    </div>
  );
}
