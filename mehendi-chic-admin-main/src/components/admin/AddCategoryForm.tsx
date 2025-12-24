import { useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/context/AdminContext';
import { useToast } from '@/hooks/use-toast';
import { uploadImageToSupabase } from '@/utils/uploadImage';
import { supabase, isSupabaseConfigured } from '@/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AddCategoryForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { addCategory, isLoggedIn } = useAdmin();
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
        description: "Please enter a category name",
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

      console.log("🚀 Starting Supabase upload for category:", name.trim());
      console.log("📁 File details:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      const finalImageUrl = await uploadImageToSupabase(selectedFile);
      console.log("✅ Upload successful, URL:", finalImageUrl);

      // Save to Supabase database (categories table)
      console.log("💾 Saving to database...");
      const { data, error: dbError } = await supabase.from("categories").insert([
        {
          name: name.trim(),
          image: finalImageUrl
        }
      ]);

      if (dbError) {
        console.error("❌ Database error:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log("✅ Database save successful:", data);

      // Add to localStorage for immediate UI update
      addCategory(name.trim(), finalImageUrl);

      toast({
        title: "Success",
        description: `Category "${name}" has been added`,
      });

      setName('');
      setImageUrl('');
      setImagePreview('');
      setSelectedFile(null);
      setOpen(false);
    } catch (error) {
      console.error("❌ Add category failed:", error);

      // Show specific error message
      let errorMessage = "Failed to add category";

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
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-mehendi-light text-primary-foreground shadow-gold transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add New Category</DialogTitle>
          <DialogDescription>
            Create a new mehendi style category with an image.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Category Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bridal Mehendi"
              className="border-border focus:border-accent focus:ring-accent"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Category Image (450×450)
            </Label>
            {imagePreview ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
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
              <label className="flex flex-col items-center justify-center w-full aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent cursor-pointer bg-muted/30 transition-colors">
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

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading}
              className="bg-primary hover:bg-mehendi-light text-primary-foreground"
            >
              {isUploading ? "Uploading..." : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
