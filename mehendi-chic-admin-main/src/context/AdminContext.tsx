import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category, Product, ContactSubmission, AdminState } from '@/types/admin';
import { fetchCategoriesFromSupabase } from '@/utils/fetchCategories';
import { fetchImagesFromSupabase } from '@/utils/fetchImages';
import { uploadImageToSupabase } from '@/utils/uploadImage';
import { adminDeleteProduct, adminDeleteCategory, validateAdminPermissions } from '@/utils/adminDelete';
import {
  addCategoryWithImage,
  updateCategoryWithImage,
  addProductWithImage,
  updateProductWithImage
} from '@/utils/imageManager';
import { supabase, isSupabaseConfigured } from '@/supabaseClient';

interface AdminContextType extends AdminState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addCategory: (name: string, imageFile: File | null) => Promise<{success: boolean, error?: string, data?: any}>;
  updateCategory: (id: string, name: string, imageFile: File | null) => Promise<{success: boolean, error?: string, data?: any}>;
  deleteCategory: (id: string) => void;
  addProduct: (name: string, categoryId: string, imageFile: File | null) => Promise<{success: boolean, error?: string, data?: any}>;
  updateProduct: (id: string, name: string, categoryId: string, imageFile: File | null) => Promise<{success: boolean, error?: string, data?: any}>;
  deleteProduct: (id: string) => void;
  addContact: (contact: Omit<ContactSubmission, 'id' | 'createdAt'>) => void;
  deleteContact: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Demo data for contacts
const demoContacts: ContactSubmission[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43210',
    message: 'I would like to book mehendi for my wedding on 15th March. Please share your packages.',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Anjali Patel',
    email: 'anjali.patel@email.com',
    phone: '+91 87654 32109',
    message: 'Looking for bridal mehendi services. Can you provide home service?',
    createdAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    name: 'Meera Gupta',
    email: 'meera.g@email.com',
    phone: '+91 76543 21098',
    message: 'Need arabic mehendi design for engagement ceremony. Budget around 5000 INR.',
    createdAt: new Date('2024-01-13'),
  },
];

// Helper functions for localStorage
const STORAGE_KEYS = {
  CATEGORIES: 'mehendi_categories',
  PRODUCTS: 'mehendi_products',
  CONTACTS: 'mehendi_contacts',
  LOGIN_STATUS: 'mehendi_is_logged_in'
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      // Convert date strings back to Date objects
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
        })) as T;
      }
      return parsed;
    }
  } catch (error) {
    console.warn(`Error reading from localStorage key ${key}:`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving to localStorage key ${key}:`, error);
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage as fallback
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    getFromStorage(STORAGE_KEYS.LOGIN_STATUS, false)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    getFromStorage(STORAGE_KEYS.CATEGORIES, [])
  );
  const [products, setProducts] = useState<Product[]>(() =>
    getFromStorage(STORAGE_KEYS.PRODUCTS, [])
  );
  const [contacts, setContacts] = useState<ContactSubmission[]>(() =>
    getFromStorage(STORAGE_KEYS.CONTACTS, demoContacts)
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadDataFromSupabase = async () => {
      if (supabase) {
        try {
          console.log("🔄 Loading data from Supabase...");

          // Load categories
          const supabaseCategories = await fetchCategoriesFromSupabase();
          if (supabaseCategories) {
            setCategories(supabaseCategories);
            saveToStorage(STORAGE_KEYS.CATEGORIES, supabaseCategories);
          }

          // Load products/images
          const supabaseProducts = await fetchImagesFromSupabase();
          if (supabaseProducts) {
            setProducts(supabaseProducts);
            saveToStorage(STORAGE_KEYS.PRODUCTS, supabaseProducts);
          }

          console.log("✅ Data loaded from Supabase");
        } catch (error) {
          console.warn("❌ Failed to load from Supabase, using localStorage:", error);
        }
      } else {
        console.log("⚠️ Supabase not configured, using localStorage only");
      }

      setIsLoading(false);
    };

    loadDataFromSupabase();
  }, []);

  // Save to localStorage whenever state changes (as backup)
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
  }, [contacts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LOGIN_STATUS, isLoggedIn);
  }, [isLoggedIn]);

  const login = (email: string, password: string): boolean => {
    // Demo login - in production, this would be a real auth check
    if (email === 'archi@mahendi.com' && password === 'Archim@123') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    // Note: Data (categories, products, contacts) persists in localStorage
    // Only login status is cleared
  };

  const addCategory = async (name: string, imageFile: File | null) => {
    console.log("🏷️ addCategory called with:", name, imageFile?.name);

    // Create temporary local state entry for optimistic UI
    const tempId = Date.now().toString();
    const tempCategory: Category = {
      id: tempId,
      name,
      image: '', // Will be updated after upload
      createdAt: new Date(),
    };

    // Add to local state immediately for better UX
    setCategories(prev => [...prev, tempCategory]);

    try {
      // Use the advanced image manager for upload and database operations
      const result = await addCategoryWithImage(name, imageFile);

      if (result.success) {
        // Update local state with actual data from database
        setCategories(prev => prev.map(cat =>
          cat.id === tempId ? {
            id: result.data.id.toString(),
            name: result.data.name,
            image: result.data.image,
            createdAt: new Date(result.data.created_at)
          } : cat
        ));

        console.log("✅ Category added successfully:", result.message);
        return { success: true, data: result.data };
      } else {
        // Remove from local state if operation failed
        setCategories(prev => prev.filter(cat => cat.id !== tempId));
        console.error("❌ Failed to add category:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      // Remove from local state if operation failed
      setCategories(prev => prev.filter(cat => cat.id !== tempId));
      console.error("❌ Add category error:", error);
      return { success: false, error: error.message };
    }
  };

  const updateCategory = async (id: string, name: string, imageFile: File | null) => {
    console.log("📝 updateCategory called with:", id, name, imageFile?.name);

    try {
      const result = await updateCategoryWithImage(id, name, imageFile);

      if (result.success) {
        // Update local state with new data
        setCategories(prev => prev.map(cat =>
          cat.id === id ? {
            ...cat,
            name: result.data.name,
            image: result.data.image
          } : cat
        ));

        console.log("✅ Category updated successfully:", result.message);
        return { success: true, data: result.data };
      } else {
        console.error("❌ Failed to update category:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ Update category error:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteCategory = async (id: string) => {
    // Validate admin permissions first
    const permissionCheck = await validateAdminPermissions();
    if (!permissionCheck.authorized) {
      console.error("❌ Admin permission denied:", permissionCheck.error);
      return;
    }

    // Delete from local state immediately for better UX
    setCategories(prev => prev.filter(cat => cat.id !== id));
    setProducts(prev => prev.filter(prod => prod.categoryId !== id));

    // Delete from Supabase using admin client
    if (supabase) {
      try {
        const result = await adminDeleteCategory(id);

        if (result.success) {
          console.log("✅ Category and products deleted from Supabase:", result.message);
          console.log(`📊 Deleted ${result.deletedProducts || 0} related products`);
        } else {
          console.error("❌ Failed to delete category from Supabase:", result.error);
          // Revert local state changes if delete failed
          // This is complex - for now we'll show error and keep optimistic updates
        }
      } catch (error) {
        console.error("❌ Admin delete category function error:", error);
      }
    }
  };

  const addProduct = async (name: string, categoryId: string, imageFile: File | null) => {
    console.log("📦 addProduct called with:", name, categoryId, imageFile?.name);

    // Create temporary local state entry for optimistic UI
    const tempId = Date.now().toString();
    const tempProduct: Product = {
      id: tempId,
      name,
      categoryId,
      image: '', // Will be updated after upload
      createdAt: new Date(),
    };

    // Add to local state immediately for better UX
    setProducts(prev => [...prev, tempProduct]);

    try {
      // Use the advanced image manager for upload and database operations
      const result = await addProductWithImage(name, categoryId, imageFile);

      if (result.success) {
        // Update local state with actual data from database
        setProducts(prev => prev.map(prod =>
          prod.id === tempId ? {
            id: result.data.id.toString(),
            name: result.data.name,
            categoryId: result.data.category_id.toString(),
            image: result.data.image_url,
            createdAt: new Date(result.data.created_at)
          } : prod
        ));

        console.log("✅ Product added successfully:", result.message);
        return { success: true, data: result.data };
      } else {
        // Remove from local state if operation failed
        setProducts(prev => prev.filter(prod => prod.id !== tempId));
        console.error("❌ Failed to add product:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      // Remove from local state if operation failed
      setProducts(prev => prev.filter(prod => prod.id !== tempId));
      console.error("❌ Add product error:", error);
      return { success: false, error: error.message };
    }
  };

  const updateProduct = async (id: string, name: string, categoryId: string, imageFile: File | null) => {
    console.log("📝 updateProduct called with:", id, name, categoryId, imageFile?.name);

    try {
      const result = await updateProductWithImage(id, name, categoryId, imageFile);

      if (result.success) {
        // Update local state with new data
        setProducts(prev => prev.map(prod =>
          prod.id === id ? {
            ...prod,
            name: result.data.name,
            categoryId: result.data.category_id.toString(),
            image: result.data.image_url
          } : prod
        ));

        console.log("✅ Product updated successfully:", result.message);
        return { success: true, data: result.data };
      } else {
        console.error("❌ Failed to update product:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ Update product error:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id: string) => {
    console.log("🗑️ deleteProduct called from UI with id:", id);

    // Validate admin permissions first
    const permissionCheck = await validateAdminPermissions();
    if (!permissionCheck.authorized) {
      console.error("❌ Admin permission denied:", permissionCheck.error);
      // You might want to show a toast notification here
      return;
    }

    console.log("✅ Admin permissions validated");

    // Delete from local state immediately for better UX
    setProducts(prev => prev.filter(prod => prod.id !== id));
    console.log("✅ Local state updated, product removed from UI");

    // Delete from Supabase using admin client
    if (supabase) {
      try {
        console.log("🚀 Starting admin delete for product:", id);
        const result = await adminDeleteProduct(id);

        if (result.success) {
          console.log("✅ Product deleted from Supabase:", result.message);
          console.log("🗂️ Storage cleanup:", result.storageDeleted ? "✅ Successful" : "⚠️ Failed but continued");
          // Optional: Show success toast
        } else {
          console.error("❌ Failed to delete product from Supabase:", result.error);
          // Revert local state change if delete failed
          // Note: This is complex in React, you might want to show an error message instead
          // For now, we'll keep the optimistic update
        }
      } catch (error) {
        console.error("❌ Admin delete function error:", error);
      }
    } else {
      console.warn("⚠️ Supabase not configured, only local state updated");
    }
  };

  const addContact = (contact: Omit<ContactSubmission, 'id' | 'createdAt'>) => {
    const newContact: ContactSubmission = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setContacts([...contacts, newContact]);
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <AdminContext.Provider
      value={{
        isLoggedIn,
        categories,
        products,
        contacts,
        login,
        logout,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        addContact,
        deleteContact,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
