import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import { fetchImagesFromSupabase } from '@/utils/fetchImages';
import { fetchCategoriesFromSupabase } from '@/utils/fetchCategories';
import { ImageLightbox } from '@/components/public/ImageLightbox';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid3X3, List } from 'lucide-react';

export default function GalleryPage() {
  const { categoryId } = useParams();
  const { categories } = useAdmin();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [categoryName, setCategoryName] = useState('');

  // Fetch images based on category
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const fetchedImages = await fetchImagesFromSupabase(categoryId);
        if (fetchedImages) {
          setImages(fetchedImages);
        } else {
          setImages([]);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [categoryId]);

  // Get category name if we have a categoryId
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === categoryId);
      setCategoryName(category ? category.name : 'Gallery');
    } else {
      setCategoryName('All Designs');
    }
  }, [categoryId, categories]);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Loading Gallery...</h3>
            <p className="text-muted-foreground">
              Fetching beautiful mehendi designs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link to={categoryId ? "/categories" : "/"}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  {categoryName}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {images.length} {images.length === 1 ? 'design' : 'designs'} available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="text-center py-16">
            <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-display text-xl text-foreground mb-2">No Designs Found</h3>
            <p className="text-muted-foreground mb-6">
              {categoryId
                ? "This category doesn't have any designs yet."
                : "No mehendi designs are available at the moment."
              }
            </p>
            <Link to="/categories">
              <Button variant="outline" className="gap-2">
                <List className="w-4 h-4" />
                Browse Categories
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer transition-transform hover:scale-105"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.image}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-white font-display text-sm font-medium truncate">
                    {image.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightboxOpen && images.length > 0 && (
          <ImageLightbox
            images={images}
            currentIndex={currentImageIndex}
            onClose={closeLightbox}
            onPrevious={goToPrevious}
            onNext={goToNext}
          />
        )}
      </div>
    </div>
  );
}
