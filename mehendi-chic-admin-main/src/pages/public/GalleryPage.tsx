import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdmin } from '@/context/AdminContext';
import { ImageLightbox } from '@/components/public/ImageLightbox';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchImagesFromSupabase } from '@/utils/fetchImages';

export default function GalleryPage() {
  const { categoryId } = useParams();
  const { categories, products } = useAdmin();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [supabaseImages, setSupabaseImages] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get the selected category
  const category = categoryId
    ? categories.find(c => c.id === categoryId)
    : null;

  // Fetch images from Supabase on component mount
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      const images = await fetchImagesFromSupabase(categoryId);
      setSupabaseImages(images);
      setLoading(false);
    };

    loadImages();
  }, [categoryId]);

  // Use Supabase images (no localStorage fallback)
  const galleryImages = supabaseImages || [];

  return (
    <div className="min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          {category ? (
            <>
              <Link to="/categories">
                <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Categories
                </Button>
              </Link>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {category.name}
              </h1>
              <p className="text-muted-foreground">
                {galleryImages.length} design{galleryImages.length !== 1 ? 's' : ''} in this collection
              </p>
            </>
          ) : (
            <div className="text-center">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                All Designs
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Browse through all our beautiful mehendi designs. 
                Click on any image to view it in full size.
              </p>
              
              {/* Category Quick Links */}
              {categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/gallery/${cat.id}`}
                      className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Loading Designs...</h3>
            <p className="text-muted-foreground">
              Fetching beautiful mehendi designs
            </p>
          </div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl">🎨</span>
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">No Designs Yet</h3>
            <p className="text-muted-foreground mb-6">
              {category 
                ? `No designs have been added to ${category.name} yet.`
                : 'No designs have been added yet.'}
            </p>
            <Link to="/categories">
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                Browse Categories
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${(index % 12) * 50}ms` }}
                onClick={() => setLightboxIndex(index)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-card hover-lift bg-card">
                  <div className="aspect-square">
                    <img
                      src={image.image}
                      alt={image.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/40 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      View
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground truncate text-center">
                  {image.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={galleryImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrevious={() => setLightboxIndex(Math.max(0, lightboxIndex - 1))}
          onNext={() => setLightboxIndex(Math.min(galleryImages.length - 1, lightboxIndex + 1))}
        />
      )}
    </div>
  );
}
