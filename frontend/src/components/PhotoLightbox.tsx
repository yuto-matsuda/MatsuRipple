import { useState, useEffect, useCallback } from 'react';
import type { FestivalGalleryPhoto } from '../types/festivalGallery';

interface PhotoLightboxProps {
  photos: FestivalGalleryPhoto[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  const photo = photos[index];

  const navBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: 'white', fontSize: '20px', width: '40px', height: '40px',
          borderRadius: '50%', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        ×
      </button>

      {/* ナビ + 画像 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '100%' }}
      >
        {photos.length > 1 && (
          <button onClick={prev} style={navBtn}>‹</button>
        )}

        <img
          src={photo.filename}
          alt={photo.original_name ?? '写真'}
          style={{
            maxWidth: '90vw', maxHeight: '80vh',
            objectFit: 'contain', borderRadius: '8px',
            display: 'block',
          }}
        />

        {photos.length > 1 && (
          <button onClick={next} style={navBtn}>›</button>
        )}
      </div>

      {/* インジケーター */}
      {photos.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', gap: '6px', marginTop: '16px' }}
        >
          {photos.map((_, i) => (
            <div
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: i === index ? '18px' : '7px', height: '7px',
                borderRadius: '4px', cursor: 'pointer',
                background: i === index ? '#c85a2c' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
