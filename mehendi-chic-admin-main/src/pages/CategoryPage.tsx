import { FolderOpen } from 'lucide-react';
import { CategoryCard } from '@/components/admin/CategoryCard';
import { AddCategoryForm } from '@/components/admin/AddCategoryForm';
import { useAdmin } from '@/context/AdminContext';

export default function CategoryPage() {
  const { categories, isLoggedIn } = useAdmin();

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Categories
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your mehendi style categories
            </p>
          </div>
          <AddCategoryForm />
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl shadow-card">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              No Categories Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isLoggedIn
                ? 'Start by adding your first mehendi category to showcase your designs'
                : 'Please login to add categories'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
