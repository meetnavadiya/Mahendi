import { Link } from 'react-router-dom';
import { Category } from '@/types/admin';

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <span className="text-4xl">🌿</span>
        </div>
        <h3 className="font-display text-xl text-foreground mb-2">No Categories Yet</h3>
        <p className="text-muted-foreground">
          Check back soon for beautiful mehendi designs!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          to={`/gallery/${category.id}`}
          className="group animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative overflow-hidden rounded-xl shadow-card hover-lift bg-card">
            <div className="aspect-square">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
            
            {/* Category Name */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-display text-xl text-primary-foreground group-hover:text-accent transition-colors duration-300">
                {category.name}
              </h3>
              <p className="text-sm text-primary-foreground/70 mt-1">
                View Gallery →
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
