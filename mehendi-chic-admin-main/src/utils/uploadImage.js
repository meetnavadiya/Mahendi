import { supabase } from "../supabaseClient";

export const uploadImageToSupabase = async (file) => {
  console.log("📤 Starting upload to Supabase storage...");

  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  // Check file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit (10MB)`);
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed. Use: JPEG, PNG, or WebP`);
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `mehendi/${fileName}`;

  console.log("📁 Uploading file:", {
    bucket: "gallery",
    originalName: file.name,
    newName: fileName,
    path: filePath,
    size: `${(file.size / 1024).toFixed(2)}KB`,
    type: file.type
  });

  try {
    // Upload to Supabase Storage bucket "gallery"
    const { data, error } = await supabase.storage
      .from("gallery")
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error("❌ Supabase upload error:", error);

      // Provide more specific error messages
      if (error.message.includes('Duplicate')) {
        throw new Error("File already exists. Please try again.");
      } else if (error.message.includes('Bucket')) {
        throw new Error("Storage bucket not found. Check if 'gallery' bucket exists.");
      } else if (error.message.includes('Policy')) {
        throw new Error("Storage policy denied upload. Check RLS policies for bucket 'gallery'.");
      } else {
        throw new Error(`Storage upload failed: ${error.message}`);
      }
    }

    console.log("✅ Upload successful, getting public URL...");

    // Get public URL from the SAME bucket and SAME file path
    const { data: urlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to generate public URL for uploaded file");
    }

    console.log("🎉 Upload complete! Public URL:", urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error("❌ Upload function error:", error);
    throw error;
  }
};
