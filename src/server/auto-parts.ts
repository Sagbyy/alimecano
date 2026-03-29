import { getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const cabinetIdSchema = z.object({
  cabinetId: z.number().int().positive(),
});

const createAutoPartSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  reference: z.string().min(1, "La référence est requise"),
  location: z.string().min(1, "L'emplacement est requis"),
  price: z.number().nonnegative("Le prix doit être positif"),
  cabinetId: z.number().int().positive("Sélectionnez une armoire"),
  compatibleVehicles: z.array(z.string()),
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
      console.error(
        `Error fetching auto parts for cabinet ${cabinetId}:`,
        error,
      );
      return null;
    }

    return data;
  });

export const getAutoParts = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("auto_part")
      .select("*, cabinet(id, name, room(id, name))");

    if (error) {
      console.error("Error fetching auto parts:", error);
      return null;
    }

    return data;
  },
);

export const searchAutoParts = createServerFn({ method: "GET" })
  .inputValidator((data: z.infer<typeof searchSchema>) =>
    searchSchema.parse(data),
  )
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

const updateAutoPartSchema = z.object({
  autoPartId: z.number().int().positive(),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  reference: z.string().min(1, "La référence est requise"),
  location: z.string().min(1, "L'emplacement est requis"),
  price: z.number().nonnegative("Le prix doit être positif"),
  compatibleVehicles: z.array(z.string()),
});

export const updateAutoPart = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof updateAutoPartSchema>) =>
    updateAutoPartSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: autoPart, error } = await supabase
      .from("auto_part")
      .update({
        name: data.name,
        description: data.description,
        reference: data.reference,
        location: data.location,
        price: data.price,
        compatible_vehicle: data.compatibleVehicles,
      })
      .eq("id", data.autoPartId)
      .select()
      .single();

    if (error) {
      console.error("Error updating auto part:", error);
      return { ok: false, error: "Erreur lors de la mise à jour de la pièce." };
    }

    return { ok: true, autoPart };
  });

export const createAutoPart = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof createAutoPartSchema>) =>
    createAutoPartSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: autoPart, error } = await supabase
      .from("auto_part")
      .insert({
        name: data.name,
        description: data.description,
        reference: data.reference,
        location: data.location,
        price: data.price,
        cabinet_id: data.cabinetId,
        compatible_vehicle: data.compatibleVehicles,
        photo_id: "", // TODO: handle photo upload
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating auto part:", error);
      return { ok: false, error: "Erreur lors de la création de la pièce." };
    }

    return { ok: true, autoPart };
  });
