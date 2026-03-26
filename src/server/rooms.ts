import { getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";
import "@tanstack/react-start/server-only";

export const getRooms = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("room")
    .select("*, cabinet(auto_part(count))");

  console.log("data", data);

  if (error) {
    console.error("Error fetching rooms:", error);
    return null;
  }

	

  return data;
});
