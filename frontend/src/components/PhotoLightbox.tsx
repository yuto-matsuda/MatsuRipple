import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxPhoto {
  filename: string;
  original_name: string | null;
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease',
      }}
    >
      {/* 閉じるボタン */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: 'white', width: '40px', height: '40px',
          borderRadius: '50%', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <X size={20} />
      </button>

      {/* ナビ + 画像 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '100%',
          transform: visible ? 'scale(1)' : 'scale(0.94)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.28s cubic-bezier(0.34,1.2,0.64,1), opacity 0.22s ease',
        }}
      >
        {photos.length > 1 && (
          <button onClick={prev} style={navBtn}><ChevronLeft size={24} /></button>
        )}

        <img
          src={photo.filename}
          alt={photo.original_name ?? '写真'}
          style={{
            maxWidth: '90vw', maxHeight: '80vh',
            objectFit: 'contain', borderRadius: '8px',
            display: 'block',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        />

        {photos.length > 1 && (
          <button onClick={next} style={navBtn}><ChevronRight size={24} /></button>
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
