import { useState } from 'react';
import { X } from 'lucide-react';
import { PhotoLightbox } from './PhotoLightbox';
import type { Photo } from '../types/photo';

interface PhotoGalleryProps {
  photos: Photo[];
  onDelete?: (photoId: number) => void;
}

export function PhotoGallery({ photos, onDelete }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
        写真はまだありません
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
        {photos.map((photo, i) => (
          <div key={photo.id} style={{ position: 'relative' }}>
            <div
              onClick={() => setLightboxIndex(i)}
              style={{ cursor: 'zoom-in' }}
            >
              <img
                src={photo.filename}
                alt={photo.original_name ?? '写真'}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', border: '1px solid #c8d8be', display: 'block' }}
              />
            </div>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: 'rgba(0,0,0,0.5)', color: 'white',
                  width: '22px', height: '22px',
                  borderRadius: '50%', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
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
