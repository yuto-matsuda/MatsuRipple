import { useState, useRef } from 'react';
import type { FestivalGalleryPhoto } from '../types/festivalGallery';
import { PhotoLightbox } from './PhotoLightbox';

interface PhotoSwiperProps {
  photos: FestivalGalleryPhoto[];
}

export function PhotoSwiper({ photos }: PhotoSwiperProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (photos.length === 0) return null;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(idx);
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* スワイプコンテナ */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            overflowX: 'scroll',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(i)}
              style={{
                flex: '0 0 100%',
                scrollSnapAlign: 'start',
                aspectRatio: '16/9',
                cursor: 'zoom-in',
                position: 'relative',
                background: '#1c2e17',
              }}
            >
              <img
                src={photo.filename}
                alt={photo.original_name ?? '写真'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>

        {/* ページインジケーター */}
        {photos.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '6px',
            marginTop: '10px',
          }}>
            {photos.map((_, i) => (
              <div
                key={i}
                onClick={() => {
                  scrollRef.current?.scrollTo({ left: i * (scrollRef.current.clientWidth), behavior: 'smooth' });
                }}
                style={{
                  width: i === currentIndex ? '18px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  background: i === currentIndex ? '#c85a2c' : '#c8d8be',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
