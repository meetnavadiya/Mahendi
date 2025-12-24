import { Package } from 'lucide-react';
import { AddProductForm } from '@/components/admin/AddProductForm';
import { ProductCard } from '@/components/admin/ProductCard';
import { useAdmin } from '@/context/AdminContext';

export default function AddProductPage() {
  const { products, categories } = useAdmin();

  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Add Product
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload new mehendi designs to your collection
          </p>
        </div>

        {/* Add Product Form */}
        <div className="mb-12">
          <AddProductForm />
        </div>

        {/* Products Section */}
        <div className="border-t border-border pt-8">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
            All Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl shadow-card">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No products added yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={getCategoryById(product.categoryId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
