import { getSupabaseAdminClient, getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

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
  photo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image trop volumineuse")
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type),
      "Format non autorisé",
    )
    .optional(),
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
  photo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image trop volumineuse")
    .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), "Format non autorisé")
    .optional(),
});

export const updateAutoPart = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const photoFile = data.get("photo");
    const compatibleVehicles = data.getAll("compatibleVehicles") as string[];
    return updateAutoPartSchema.parse({
      autoPartId: Number(data.get("autoPartId")),
      name: data.get("name"),
      description: data.get("description"),
      reference: data.get("reference"),
      location: data.get("location"),
      price: Number(data.get("price")),
      compatibleVehicles,
      photo: photoFile instanceof File && photoFile.size > 0 ? photoFile : undefined,
    });
  })
  .handler(async ({ data }: { data: z.infer<typeof updateAutoPartSchema> }) => {
    const supabase = getSupabaseAdminClient();

    let photoUrl: string | undefined;

    if (data.photo) {
      const { data: existing } = await supabase
        .from("auto_part").select("photo_url").eq("id", data.autoPartId).single();

      if (existing?.photo_url) {
        const old = new URL(existing.photo_url).pathname.split("/auto-parts/")[1];
        if (old) await supabase.storage.from("auto-parts").remove([old]);
      }

      const path = `${Date.now()}-${crypto.randomUUID()}.${data.photo.name.split(".").pop()}`;
      await supabase.storage.from("auto-parts").upload(path, data.photo, {
        contentType: data.photo.type, upsert: false, cacheControl: "3600",
      });
      photoUrl = supabase.storage.from("auto-parts").getPublicUrl(path).data.publicUrl;
    }

    const { data: autoPart, error } = await supabase
      .from("auto_part")
      .update({
        name: data.name,
        description: data.description,
        reference: data.reference,
        location: data.location,
        price: data.price,
        compatible_vehicle: data.compatibleVehicles,
        updated_at: new Date().toISOString(),
        ...(photoUrl !== undefined && { photo_url: photoUrl }),
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
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    const photoFile = data.get("photo");
    const compatibleVehicles = data.getAll("compatibleVehicles") as string[];

    const parsed = createAutoPartSchema.parse({
      name: data.get("name"),
      description: data.get("description"),
      reference: data.get("reference"),
      location: data.get("location"),
      price: Number(data.get("price")),
      cabinetId: Number(data.get("cabinetId")),
      compatibleVehicles,
      photo: photoFile instanceof File && photoFile.size > 0 ? photoFile : undefined,
    });

    return parsed;
  })
  .handler(async ({ data }: { data: z.infer<typeof createAutoPartSchema> }) => {
    const supabase = getSupabaseAdminClient();

    let photoUrl = "";

    if (data.photo) {
      const photoNamePath = `${Date.now()}-${crypto.randomUUID()}.${data.photo.name.split(".").pop()}`;
      const { error: photoUploadError } = await supabase.storage
        .from("auto-parts")
        .upload(photoNamePath, data.photo, {
          contentType: data.photo.type,
          upsert: false,
          cacheControl: "3600",
        });

      if (photoUploadError) {
        throw new Error(`Upload Supabase échoué: ${photoUploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("auto-parts")
        .getPublicUrl(photoNamePath);

      photoUrl = publicUrlData.publicUrl;
    }

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
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating auto part:", error);
      return { ok: false, error: "Erreur lors de la création de la pièce." };
    }

    return { ok: true, autoPart };
  });

export const deleteAutoPart = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof autoPartIdSchema>) =>
    autoPartIdSchema.parse(data),
  )
  .handler(async ({ data: { autoPartId } }) => {
    const supabase = getSupabaseAdminClient();

    const { data: autoPart, error: fetchError } = await supabase
      .from("auto_part")
      .select("photo_url")
      .eq("id", autoPartId)
      .single();

    if (fetchError) {
      console.error("Error fetching auto part for deletion:", fetchError);
      return { ok: false, error: "Pièce introuvable." };
    }

    if (autoPart.photo_url) {
      const url = new URL(autoPart.photo_url);
      const pathParts = url.pathname.split("/auto-parts/");
      if (pathParts[1]) {
        await supabase.storage.from("auto-parts").remove([pathParts[1]]);
      }
    }

    const { error } = await supabase
      .from("auto_part")
      .delete()
      .eq("id", autoPartId);

    if (error) {
      console.error("Error deleting auto part:", error);
      return { ok: false, error: "Erreur lors de la suppression de la pièce." };
    }

    return { ok: true };
  });
