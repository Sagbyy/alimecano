import { getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const cabinetIdSchema = z.object({
  cabinetId: z.number().int().positive(),
});

const autoPartIdSchema = z.object({
  autoPartId: z.int().positive(),
});

const searchSchema = z.object({
  query: z.string().min(1),
});

type AutoPartId = z.infer<typeof autoPartIdSchema>;

export const getAutoPartsByCabinetId = createServerFn({ method: "GET" })
  .inputValidator((data: z.infer<typeof cabinetIdSchema>) =>
    cabinetIdSchema.parse(data),
  )
  .handler(async ({ data: { cabinetId } }) => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("auto_part")
      .select("*")
      .eq("cabinet_id", cabinetId);

    if (error) {
      console.error(`Error fetching auto parts for cabinet ${cabinetId}:`, error);
      return null;
    }

    return data;
  });

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

export const searchAutoParts = createServerFn({ method: "GET" })
  .inputValidator((data: z.infer<typeof searchSchema>) => searchSchema.parse(data))
  .handler(async ({ data: { query } }) => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("auto_part")
      .select("*, cabinet(id, name, room(id, name))")
      .or(
        `name.ilike.%${query}%,description.ilike.%${query}%,reference.ilike.%${query}%,location.ilike.%${query}%`,
      );

    if (error) {
      console.error("Error searching auto parts:", error);
      return null;
    }

    return data;
  });

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
