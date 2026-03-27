import { getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";

export const getCabinets = createServerFn().handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("cabinet")
    .select("*, auto_part(count)");

  if (error) {
    console.error("Error fetching cabinets:", error);
    return null;
  }

  return data;
});
