import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface ImageLightboxProps {
  images: { id: string; image: string; name: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function ImageLightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onPrevious, 
  onNext 
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrevious();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrevious, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  if (!currentImage) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-primary/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-primary-foreground hover:text-accent transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 p-2 text-primary-foreground hover:text-accent transition-colors"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      {/* Image */}
      <div 
        className="max-w-4xl max-h-[80vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.image}
          alt={currentImage.name}
          className="max-w-full max-h-[70vh] object-contain rounded-lg"
        />
        <p className="text-center text-primary-foreground mt-4 font-display text-lg">
          {currentImage.name}
        </p>
        <p className="text-center text-primary-foreground/60 text-sm mt-1">
          {currentIndex + 1} of {images.length}
        </p>
      </div>

      {/* Next button */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 p-2 text-primary-foreground hover:text-accent transition-colors"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}
    </div>
  );
}
