import { createClient } from '@supabase/supabase-js';

// Admin client with service role key for secure operations
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Generate unique filename for uploaded images
 * Format: mehendi-{entity}-{entityId}-{timestamp}-{random}.{extension}
 */
function generateUniqueFilename(entity, entityId, originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop().toLowerCase();
  return `mehendi-${entity}-${entityId}-${timestamp}-${random}.${extension}`;
}

/**
 * Extract storage path from Supabase storage URL
 */
function extractStoragePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const publicIndex = pathParts.indexOf('public');
    if (publicIndex === -1 || publicIndex >= pathParts.length - 1) return null;
    return pathParts.slice(publicIndex + 1).join('/');
  } catch (error) {
    console.warn('Invalid image URL format:', imageUrl);
    return null;
  }
}

/**
 * Upload image to Supabase Storage with duplicate prevention
 */
async function uploadImageToStorage(file, entity, entityId) {
  try {
    if (!file) throw new Error('No file provided');

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit (10MB)`);
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Use: JPEG, PNG, or WebP`);
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(entity, entityId, file.name);
    const storagePath = `mehendi/${entity}/${uniqueFilename}`;

    console.log(`📤 Uploading ${entity} image:`, {
      originalName: file.name,
      uniqueName: uniqueFilename,
      path: storagePath,
      size: `${(file.size / 1024).toFixed(2)}KB`,
      type: file.type
    });

    // Upload to storage
    const { data, error } = await supabaseAdmin.storage
      .from('gallery')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false, // Prevent overwriting existing files
        contentType: file.type
      });

    if (error) {
      if (error.message.includes('Duplicate')) {
        throw new Error('File already exists. Please try again.');
      }
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('gallery')
      .getPublicUrl(storagePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to generate public URL for uploaded file');
    }

    console.log('✅ Image uploaded successfully:', urlData.publicUrl);
    return {
      success: true,
      url: urlData.publicUrl,
      path: storagePath,
      filename: uniqueFilename
    };

  } catch (error) {
    console.error('❌ Image upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete image from Supabase Storage
 */
async function deleteImageFromStorage(imageUrl) {
  try {
    if (!imageUrl) {
      console.log('No image URL provided, skipping cleanup');
      return { success: true };
    }

    const storagePath = extractStoragePath(imageUrl);
    if (!storagePath) {
      console.warn('Could not extract storage path from URL:', imageUrl);
      return { success: false, error: 'Invalid image URL format' };
    }

    console.log(`🗂️ Deleting image from storage: ${storagePath}`);

    const { data, error } = await supabaseAdmin.storage
      .from('gallery')
      .remove([storagePath]);

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
 * Check if image URL is already being used by another entity
 */
async function isImageInUse(imageUrl, excludeEntity = null, excludeId = null) {
  try {
    if (!imageUrl) return false;

    // Check categories table
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, image')
      .eq('image', imageUrl);

    // Check images table
    const { data: images } = await supabaseAdmin
      .from('images')
      .select('id, image_url')
      .eq('image_url', imageUrl);

    // Filter out the current entity if updating
    let totalUsage = 0;

    if (categories && categories.length > 0) {
      if (excludeEntity === 'category' && excludeId) {
        totalUsage += categories.filter(cat => cat.id !== parseInt(excludeId)).length;
      } else {
        totalUsage += categories.length;
      }
    }

    if (images && images.length > 0) {
      if (excludeEntity === 'product' && excludeId) {
        totalUsage += images.filter(img => img.id !== parseInt(excludeId)).length;
      } else {
        totalUsage += images.length;
      }
    }

    return totalUsage > 0;

  } catch (error) {
    console.error('Error checking image usage:', error);
    return false; // Assume not in use if check fails
  }
}

/**
 * Add category with image upload and duplicate prevention
 */
export async function addCategoryWithImage(name, imageFile) {
  try {
    console.log('🏷️ Adding category:', name);

    // Validate input
    if (!name?.trim()) {
      return { success: false, error: 'Category name is required' };
    }

    // Check if category name already exists
    const { data: existingCategories } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .eq('name', name.trim());

    if (existingCategories && existingCategories.length > 0) {
      return { success: false, error: `Category "${name}" already exists` };
    }

    // Upload image if provided
    let imageUrl = null;
    if (imageFile) {
      const tempEntityId = Date.now(); // Temporary ID for filename generation
      const uploadResult = await uploadImageToStorage(imageFile, 'category', tempEntityId);

      if (!uploadResult.success) {
        return { success: false, error: `Image upload failed: ${uploadResult.error}` };
      }

      imageUrl = uploadResult.url;
    }

    // Create category in database
    const categoryData = {
      name: name.trim(),
      image: imageUrl
    };

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      // Cleanup uploaded image if database insert fails
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('✅ Category added successfully:', data);
    return {
      success: true,
      data,
      message: `Category "${name}" added successfully`
    };

  } catch (error) {
    console.error('❌ Add category error:', error);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
}

/**
 * Update category with image replacement and cleanup
 */
export async function updateCategoryWithImage(categoryId, name, imageFile) {
  try {
    console.log('📝 Updating category:', categoryId, name);

    // Validate input
    if (!categoryId) {
      return { success: false, error: 'Category ID is required' };
    }

    if (!name?.trim()) {
      return { success: false, error: 'Category name is required' };
    }

    // Get current category data
    const { data: currentCategory, error: fetchError } = await supabaseAdmin
      .from('categories')
      .select('id, name, image')
      .eq('id', parseInt(categoryId))
      .single();

    if (fetchError || !currentCategory) {
      return { success: false, error: 'Category not found' };
    }

    // Check if new name conflicts with other categories
    const { data: conflictingCategories } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .eq('name', name.trim())
      .neq('id', parseInt(categoryId));

    if (conflictingCategories && conflictingCategories.length > 0) {
      return { success: false, error: `Category name "${name}" already exists` };
    }

    let newImageUrl = currentCategory.image;

    // Upload new image if provided
    if (imageFile) {
      // Upload new image
      const uploadResult = await uploadImageToStorage(imageFile, 'category', categoryId);

      if (!uploadResult.success) {
        return { success: false, error: `Image upload failed: ${uploadResult.error}` };
      }

      newImageUrl = uploadResult.url;

      // Delete old image if it exists and is not used by other entities
      if (currentCategory.image && currentCategory.image !== newImageUrl) {
        const isOldImageInUse = await isImageInUse(currentCategory.image, 'category', categoryId);
        if (!isOldImageInUse) {
          console.log('🗑️ Deleting old category image...');
          await deleteImageFromStorage(currentCategory.image);
        }
      }
    }

    // Update category in database
    const updateData = {
      name: name.trim(),
      image: newImageUrl
    };

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updateData)
      .eq('id', parseInt(categoryId))
      .select()
      .single();

    if (error) {
      // Cleanup newly uploaded image if update fails
      if (imageFile && newImageUrl !== currentCategory.image) {
        await deleteImageFromStorage(newImageUrl);
      }
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('✅ Category updated successfully:', data);
    return {
      success: true,
      data,
      message: `Category "${name}" updated successfully`
    };

  } catch (error) {
    console.error('❌ Update category error:', error);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
}

/**
 * Add product with image upload and duplicate prevention
 */
export async function addProductWithImage(name, categoryId, imageFile) {
  try {
    console.log('📦 Adding product:', name, 'to category:', categoryId);

    // Validate input
    if (!name?.trim()) {
      return { success: false, error: 'Product name is required' };
    }

    if (!categoryId) {
      return { success: false, error: 'Category ID is required' };
    }

    // Verify category exists
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .eq('id', parseInt(categoryId))
      .single();

    if (!category) {
      return { success: false, error: 'Selected category does not exist' };
    }

    // Upload image if provided
    let imageUrl = null;
    if (imageFile) {
      const uploadResult = await uploadImageToStorage(imageFile, 'product', Date.now());

      if (!uploadResult.success) {
        return { success: false, error: `Image upload failed: ${uploadResult.error}` };
      }

      imageUrl = uploadResult.url;
    }

    // Create product in database
    const productData = {
      name: name.trim(),
      category_id: parseInt(categoryId),
      image_url: imageUrl
    };

    const { data, error } = await supabaseAdmin
      .from('images')
      .insert([productData])
      .select()
      .single();

    if (error) {
      // Cleanup uploaded image if database insert fails
      if (imageUrl) {
        await deleteImageFromStorage(imageUrl);
      }
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('✅ Product added successfully:', data);
    return {
      success: true,
      data,
      message: `Product "${name}" added successfully to category "${category.name}"`
    };

  } catch (error) {
    console.error('❌ Add product error:', error);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
}

/**
 * Update product with image replacement and cleanup
 */
export async function updateProductWithImage(productId, name, categoryId, imageFile) {
  try {
    console.log('📝 Updating product:', productId, name);

    // Validate input
    if (!productId) {
      return { success: false, error: 'Product ID is required' };
    }

    if (!name?.trim()) {
      return { success: false, error: 'Product name is required' };
    }

    if (!categoryId) {
      return { success: false, error: 'Category ID is required' };
    }

    // Get current product data
    const { data: currentProduct, error: fetchError } = await supabaseAdmin
      .from('images')
      .select('id, name, category_id, image_url')
      .eq('id', parseInt(productId))
      .single();

    if (fetchError || !currentProduct) {
      return { success: false, error: 'Product not found' };
    }

    // Verify category exists
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .eq('id', parseInt(categoryId))
      .single();

    if (!category) {
      return { success: false, error: 'Selected category does not exist' };
    }

    let newImageUrl = currentProduct.image_url;

    // Upload new image if provided
    if (imageFile) {
      // Upload new image
      const uploadResult = await uploadImageToStorage(imageFile, 'product', productId);

      if (!uploadResult.success) {
        return { success: false, error: `Image upload failed: ${uploadResult.error}` };
      }

      newImageUrl = uploadResult.url;

      // Delete old image if it exists and is not used by other entities
      if (currentProduct.image_url && currentProduct.image_url !== newImageUrl) {
        const isOldImageInUse = await isImageInUse(currentProduct.image_url, 'product', productId);
        if (!isOldImageInUse) {
          console.log('🗑️ Deleting old product image...');
          await deleteImageFromStorage(currentProduct.image_url);
        }
      }
    }

    // Update product in database
    const updateData = {
      name: name.trim(),
      category_id: parseInt(categoryId),
      image_url: newImageUrl
    };

    const { data, error } = await supabaseAdmin
      .from('images')
      .update(updateData)
      .eq('id', parseInt(productId))
      .select()
      .single();

    if (error) {
      // Cleanup newly uploaded image if update fails
      if (imageFile && newImageUrl !== currentProduct.image_url) {
        await deleteImageFromStorage(newImageUrl);
      }
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('✅ Product updated successfully:', data);
    return {
      success: true,
      data,
      message: `Product "${name}" updated successfully`
    };

  } catch (error) {
    console.error('❌ Update product error:', error);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
}

// Export admin client for advanced operations
export { supabaseAdmin };
