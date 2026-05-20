import type { Photo } from '../types/photo';

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
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
        <a
          key={photo.id}
          href={photo.filename}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={photo.filename}
            alt={photo.original_name ?? '写真'}
            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', border: '1px solid #c8d8be', display: 'block' }}
          />
        </a>
      ))}
    </div>
  );
}
