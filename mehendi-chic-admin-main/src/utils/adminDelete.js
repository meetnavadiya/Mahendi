import { createClient } from '@supabase/supabase-js';

// Lazy initialization of admin client to ensure environment variables are loaded
let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      throw new Error('supabaseUrl is required. Make sure VITE_SUPABASE_URL is set in .env file.');
    }

    if (!serviceRoleKey && !anonKey) {
      throw new Error('Service role key or anon key is required for admin operations.');
    }

    supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey || anonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return supabaseAdmin;
}

/**
 * Extract storage path from Supabase storage URL
 * @param {string} imageUrl - Full Supabase storage URL
 * @returns {string|null} - Storage path or null if not a valid URL
 */
function extractStoragePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  try {
    // Supabase storage URLs typically look like:
    // https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');

    // Find the bucket name and path after 'public'
    const publicIndex = pathParts.indexOf('public');
    if (publicIndex === -1 || publicIndex >= pathParts.length - 1) {
      return null;
    }

    // Return the path after 'public' (bucket/path)
    return pathParts.slice(publicIndex + 1).join('/');
  } catch (error) {
    console.warn('Invalid image URL format:', imageUrl);
    return null;
  }
}

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - The full image URL from the database
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteImageFromStorage(imageUrl) {
  try {
    if (!imageUrl) {
      console.log('No image URL provided, skipping storage cleanup');
      return { success: true };
    }

    const storagePath = extractStoragePath(imageUrl);
    if (!storagePath) {
      console.warn('Could not extract storage path from URL:', imageUrl);
      return { success: false, error: 'Invalid image URL format' };
    }

    console.log(`🗂️ Deleting image from storage: ${storagePath}`);

    // Split path into bucket and file path
    const pathParts = storagePath.split('/');
    const bucket = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    if (!bucket || !filePath) {
      return { success: false, error: 'Could not determine bucket or file path' };
    }

    const { data, error } = await getSupabaseAdmin()
      .storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('❌ Storage delete error:', error);
      return { success: false, error: `Storage delete failed: ${error.message}` };
    }

    console.log('✅ Image deleted from storage successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Storage cleanup error:', error);
    return { success: false, error: `Storage cleanup failed: ${error.message}` };
  }
}

/**
 * Secure admin delete function for products
 * Uses service role key to bypass RLS and perform admin operations
 *
 * @param {string|number} productId - The ID of the product to delete
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function adminDeleteProduct(productId) {
  console.log("🔥 adminDeleteProduct called with:", productId);

  try {
    // Validate input
    if (!productId) {
      console.error("❌ Product ID is required");
      return {
        success: false,
        error: 'Product ID is required'
      };
    }

    // Convert to number if it's a string
    const id = typeof productId === 'string' ? parseInt(productId) : productId;

    if (isNaN(id)) {
      console.error("❌ Invalid product ID format:", productId);
      return {
        success: false,
        error: 'Invalid product ID format'
      };
    }

    console.log(`🗑️ Admin deleting product with ID: ${id}`);

    // Step 1: Fetch the product data first to get the image URL
    const { data: productData, error: fetchError } = await getSupabaseAdmin()
      .from('images')
      .select('id, name, image_url')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching product:', fetchError);
      return {
        success: false,
        error: `Failed to fetch product: ${fetchError.message}`
      };
    }

    if (!productData) {
      return {
        success: false,
        error: `Product with ID ${id} not found`
      };
    }

    console.log(`📦 Found product: ${productData.name || `ID ${id}`}`);

    // Step 2: Delete image from storage (if exists)
    const storageCleanup = await deleteImageFromStorage(productData.image_url);

    if (!storageCleanup.success) {
      console.warn('⚠️ Storage cleanup failed, but continuing with database delete:', storageCleanup.error);
      // Don't return error here - we still want to delete the database record
    }

    // Step 3: Delete the database record
    const { data: deleteData, error: deleteError } = await getSupabaseAdmin()
      .from('images')
      .delete()
      .eq('id', id)
      .select(); // Return the deleted record

    if (deleteError) {
      console.error('❌ Database delete error:', deleteError);
      return {
        success: false,
        error: `Database delete failed: ${deleteError.message}`
      };
    }

    // Check if any record was actually deleted
    if (!deleteData || deleteData.length === 0) {
      return {
        success: false,
        error: `Product with ID ${id} not found`
      };
    }

    const product = deleteData[0];
    console.log('✅ Admin delete successful:', product);
    console.log(`🗑️ Product "${product.name || `ID ${id}`}" and its image have been completely removed`);

    return {
      success: true,
      data: product,
      storageDeleted: storageCleanup.success,
      message: `Product "${product.name || `ID ${id}`}" and its image have been deleted successfully`
    };

  } catch (error) {
    console.error('❌ Admin delete function error:', error);
    return {
      success: false,
      error: `Unexpected error: ${error.message}`
    };
  }
}

/**
 * Secure admin delete function for categories
 * Also deletes all related products
 *
 * @param {string|number} categoryId - The ID of the category to delete
 * @returns {Promise<{success: boolean, data?: any, deletedProducts?: number, error?: string}>}
 */
export async function adminDeleteCategory(categoryId) {
  try {
    // Validate input
    if (!categoryId) {
      return {
        success: false,
        error: 'Category ID is required'
      };
    }

    const id = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;

    if (isNaN(id)) {
      return {
        success: false,
        error: 'Invalid category ID format'
      };
    }

    console.log(`🗑️ Admin deleting category with ID: ${id}`);

    // Step 1: First fetch all products in this category to get their image URLs
    const { data: productsToDelete, error: fetchError } = await getSupabaseAdmin()
      .from('images')
      .select('id, name, image_url')
      .eq('category_id', id);

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      return {
        success: false,
        error: `Error fetching products: ${fetchError.message}`
      };
    }

    const productsCount = productsToDelete ? productsToDelete.length : 0;
    console.log(`📦 Found ${productsCount} products in category ${id}`);

    // Step 2: Delete images from storage
    let storageCleanupSuccess = true;
    if (productsToDelete && productsToDelete.length > 0) {
      for (const product of productsToDelete) {
        if (product.image_url) {
          const cleanup = await deleteImageFromStorage(product.image_url);
          if (!cleanup.success) {
            console.warn(`⚠️ Failed to delete image for product ${product.id}:`, cleanup.error);
            storageCleanupSuccess = false; // Don't fail completely, just warn
          }
        }
      }
    }

    // Step 3: Delete all products from database
    const { data: deletedProducts, error: productsError } = await getSupabaseAdmin()
      .from('images')
      .delete()
      .eq('category_id', id)
      .select();

    if (productsError) {
      console.error('❌ Error deleting products:', productsError);
      return {
        success: false,
        error: `Error deleting products: ${productsError.message}`
      };
    }

    // Then delete the category
    const { data: deletedCategory, error: categoryError } = await getSupabaseAdmin()
      .from('categories')
      .delete()
      .eq('id', id)
      .select();

    if (categoryError) {
      console.error('❌ Error deleting category:', categoryError);
      return {
        success: false,
        error: `Error deleting category: ${categoryError.message}`
      };
    }

    if (!deletedCategory || deletedCategory.length === 0) {
      return {
        success: false,
        error: `Category with ID ${id} not found`
      };
    }

    const deletedProductsCount = deletedProducts ? deletedProducts.length : 0;

    console.log(`✅ Admin delete successful: Category "${deletedCategory[0].name}" and ${deletedProductsCount} products deleted`);

    return {
      success: true,
      data: deletedCategory[0],
      deletedProducts: deletedProductsCount,
      storageCleaned: storageCleanupSuccess,
      message: `Category "${deletedCategory[0].name}" and ${deletedProductsCount} related products have been deleted successfully${storageCleanupSuccess ? ' (including images from storage)' : ' (some images may remain in storage)'}`
    };

  } catch (error) {
    console.error('❌ Admin delete category function error:', error);
    return {
      success: false,
      error: `Unexpected error: ${error.message}`
    };
  }
}

/**
 * Check if the current user is an admin
 * This is a basic check - in production, implement proper authentication
 *
 * @returns {boolean}
 */
export function isCurrentUserAdmin() {
  // For now, we'll assume all logged-in users are admins
  // In production, implement proper role-based authentication
  return true; // Replace with actual admin check
}

/**
 * Validate admin permissions before performing delete operations
 *
 * @returns {Promise<{authorized: boolean, error?: string}>}
 */
export async function validateAdminPermissions() {
  try {
    // Check if user is logged in and is admin
    if (!isCurrentUserAdmin()) {
      return {
        authorized: false,
        error: 'Unauthorized: Admin access required'
      };
    }

    // Additional checks can be added here (rate limiting, etc.)

    return { authorized: true };

  } catch (error) {
    return {
      authorized: false,
      error: 'Permission validation failed'
    };
  }
}

// Export admin client getter for advanced operations if needed
export { getSupabaseAdmin as supabaseAdmin };
