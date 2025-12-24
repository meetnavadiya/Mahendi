import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { CategoryGrid } from '@/components/public/CategoryGrid';
import { fetchCategoriesFromSupabase } from '@/utils/fetchCategories';

export default function PublicCategoryPage() {
  const { categories } = useAdmin();
  const [supabaseCategories, setSupabaseCategories] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories from Supabase on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const cats = await fetchCategoriesFromSupabase();
      setSupabaseCategories(cats);
      setLoading(false);
    };

    loadCategories();
  }, []);

  // Use Supabase categories (no localStorage fallback)
  const displayCategories = supabaseCategories || [];

  return (
    <div className="min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Mehendi Categories
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our diverse collection of mehendi styles. Each category features 
            unique designs crafted with precision and artistry.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Loading Categories...</h3>
            <p className="text-muted-foreground">
              Fetching beautiful mehendi categories
            </p>
          </div>
        ) : (
          <CategoryGrid categories={displayCategories} />
        )}
      </div>
    </div>
  );
}
