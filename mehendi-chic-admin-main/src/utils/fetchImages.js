import { supabase } from "../supabaseClient";

export const fetchImagesFromSupabase = async (categoryId = null) => {
  try {
    let query = supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform Supabase data to match our Product interface
    return data.map(item => ({
      id: item.id.toString(),
      name: item.name || `Design ${item.id}`,
      categoryId: item.category_id,
      image: item.image_url,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.warn("Failed to fetch from Supabase:", error);
    return null; // Return null to indicate fallback to localStorage
  }
};
