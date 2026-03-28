import { getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createCabinetSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  roomId: z.number().int().positive("Sélectionnez une salle"),
});

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

export const createCabinet = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof createCabinetSchema>) =>
    createCabinetSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: cabinet, error } = await supabase
      .from("cabinet")
      .insert({
        name: data.name,
        description: data.description,
        room_id: data.roomId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating cabinet:", error);
      return { ok: false, error: "Erreur lors de la création de l'armoire." };
    }

    return { ok: true, cabinet };
  });
