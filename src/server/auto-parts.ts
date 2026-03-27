import { getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const autoPartIdSchema = z.object({
  autoPartId: z.int().positive(),
});

type AutoPartId = z.infer<typeof autoPartIdSchema>;

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

export const getAutoPartById = createServerFn({
  method: "GET",
})
  .inputValidator((data: AutoPartId) => autoPartIdSchema.parse(data))
  .handler(async ({ data: { autoPartId } }) => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("auto_part")
      .select("*")
      .eq("id", autoPartId)
      .single();

    if (error) {
      console.error(`Error fetching auto part with id ${autoPartId}:`, error);
      return null;
    }

    return data;
  });
