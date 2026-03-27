import { getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";

export const getAutoParts = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("auto_part").select("*");

    if (error) {
      console.error("Error fetching auto parts:", error);
      return null;
    }

    return data;
  },
);
