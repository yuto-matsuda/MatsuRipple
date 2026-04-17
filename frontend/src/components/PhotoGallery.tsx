import type { Photo } from '../types/photo';

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return <p className="text-gray-500 text-center py-8">写真はまだありません</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {photos.map((photo) => (
        <a
          key={photo.id}
          href={`/uploads/${photo.filename}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={`/uploads/${photo.filename}`}
            alt={photo.original_name ?? '写真'}
            className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
          />
        </a>
      ))}
    </div>
  );
}
