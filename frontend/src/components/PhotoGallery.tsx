import { X } from 'lucide-react';
import type { Photo } from '../types/photo';

interface PhotoGalleryProps {
  photos: Photo[];
  onDelete?: (photoId: number) => void;
}

export function PhotoGallery({ photos, onDelete }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '13px', color: '#7a9470', fontFamily: 'var(--font-body)' }}>
        写真はまだありません
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
      {photos.map((photo) => (
        <div key={photo.id} style={{ position: 'relative' }}>
          <a href={photo.filename} target="_blank" rel="noopener noreferrer">
            <img
              src={photo.filename}
              alt={photo.original_name ?? '写真'}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', border: '1px solid #c8d8be', display: 'block' }}
            />
          </a>
          {onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); onDelete(photo.id); }}
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
  );
}
