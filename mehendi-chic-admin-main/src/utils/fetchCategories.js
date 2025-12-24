import { supabase } from "../supabaseClient";

export const fetchCategoriesFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform Supabase data to match our Category interface
    return data.map(item => ({
      id: item.id.toString(),
      name: item.name,
      image: item.image,
      createdAt: new Date(item.created_at)
    }));
  } catch (error) {
    console.warn("Failed to fetch categories from Supabase:", error);
    return null; // Return null to indicate fallback to localStorage
  }
};
