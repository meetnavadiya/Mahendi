import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdmin } from '@/context/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { uploadImageToSupabase } from '@/utils/uploadImage';
import { supabase, isSupabaseConfigured } from '@/supabaseClient';

export function AddProductForm() {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { categories, addProduct, isLoggedIn } = useAdmin();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product name",
        variant: "destructive",
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase (required)
      if (!selectedFile) {
        toast({
          title: "Error",
          description: "Please select an image file to upload",
          variant: "destructive",
        });
        return;
      }

      // Check Supabase configuration
      if (!supabase) {
        toast({
          title: "Configuration Error",
          description: "Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables to your hosting platform.",
          variant: "destructive",
        });
        return;
      }

      console.log("🚀 Starting Supabase upload for product:", name.trim());
      console.log("📁 File details:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      const finalImageUrl = await uploadImageToSupabase(selectedFile);
      console.log("✅ Upload successful, URL:", finalImageUrl);

      // Save to Supabase database (images table)
      console.log("💾 Saving to database...");
      const { data, error: dbError } = await supabase.from("images").insert([
        {
          image_url: finalImageUrl,
          category_id: categoryId,
          name: name.trim()
        }
      ]);

      if (dbError) {
        console.error("❌ Database error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log("✅ Database save successful:", data);

      // Add to localStorage for immediate UI update
      addProduct(name.trim(), categoryId, finalImageUrl);

      toast({
        title: "Success",
        description: `Product "${name}" has been added`,
      });

      setName('');
      setCategoryId('');
      setImageUrl('');
      setImagePreview('');
      setSelectedFile(null);
    } catch (error) {
      console.error("❌ Add product failed:", error);

      // Show specific error message
      let errorMessage = "Failed to add product";

      if (error.message?.includes("Storage")) {
        errorMessage = "Storage upload failed. Check your Supabase configuration.";
      } else if (error.message?.includes("Database")) {
        errorMessage = "Database save failed. Check your table structure.";
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = "Network error. Check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          Please login to add products
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-xl shadow-card">
        <p className="text-muted-foreground text-lg mb-2">
          No categories available
        </p>
        <p className="text-sm text-muted-foreground">
          Please create a category first before adding products
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-card p-6 md:p-8 max-w-2xl mx-auto animate-fade-in">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
        Add New Product
      </h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-foreground font-medium">
            Product Name
          </Label>
          <Input
            id="productName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Elegant Bridal Pattern"
            className="border-border focus:border-accent focus:ring-accent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-foreground font-medium">
            Category
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="border-border focus:border-accent focus:ring-accent">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">
            Product Image (450×450)
          </Label>
          {imagePreview ? (
            <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden border border-border">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview('');
                  setImageUrl('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-sm aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent cursor-pointer bg-muted/30 transition-colors">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload</span>
              <span className="text-xs text-muted-foreground mt-1">Recommended: 450×450</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <Button
          type="submit"
          disabled={isUploading}
          className="w-full bg-primary hover:bg-mehendi-light text-primary-foreground shadow-gold transition-all duration-300"
        >
          {isUploading ? "Uploading..." : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
