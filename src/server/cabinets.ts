import { getSupabaseAdminClient, getSupabaseServerClient } from "#/utils/supabase";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const roomIdSchema = z.object({
  roomId: z.number().int().positive(),
});

const cabinetIdSchema = z.object({
  cabinetId: z.number().int().positive(),
});

const createCabinetSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  roomId: z.number().int().positive("Sélectionnez une salle"),
  photo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image trop volumineuse")
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type),
      "Format non autorisé",
    )
    .optional(),
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

export const getCabinetsByRoomId = createServerFn()
  .inputValidator((data: z.infer<typeof roomIdSchema>) =>
    roomIdSchema.parse(data),
  )
  .handler(async ({ data: { roomId } }) => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("cabinet")
      .select("*, auto_part(count)")
      .eq("room_id", roomId);

    if (error) {
      console.error(`Error fetching cabinet with room ${roomId}:`, error);
      return null;
    }

    return data;
  });

export const getCabinetById = createServerFn()
  .inputValidator((data: z.infer<typeof cabinetIdSchema>) =>
    cabinetIdSchema.parse(data),
  )
  .handler(async ({ data: { cabinetId } }) => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("cabinet")
      .select("*")
      .eq("id", cabinetId)
      .single();

    if (error) {
      console.error(`Error fetching cabinet ${cabinetId}:`, error);
      return null;
    }

    return data;
  });

const updateCabinetSchema = z.object({
  cabinetId: z.number().int().positive(),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
});

export const updateCabinet = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof updateCabinetSchema>) =>
    updateCabinetSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: cabinet, error } = await supabase
      .from("cabinet")
      .update({ name: data.name, description: data.description })
      .eq("id", data.cabinetId)
      .select()
      .single();

    if (error) {
      console.error("Error updating cabinet:", error);
      return { ok: false, error: "Erreur lors de la mise à jour de l'armoire." };
    }

    return { ok: true, cabinet };
  });

export const createCabinet = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    const photoFile = data.get("photo");
    const parsed = createCabinetSchema.parse({
      name: data.get("name"),
      description: data.get("description"),
      roomId: Number(data.get("roomId")),
      photo: photoFile instanceof File && photoFile.size > 0 ? photoFile : undefined,
    });

    return parsed;
  })
  .handler(async ({ data }: { data: z.infer<typeof createCabinetSchema> }) => {
    const supabase = getSupabaseAdminClient();

    let photoUrl: string | null = null;

    if (data.photo) {
      const photoNamePath = `${Date.now()}-${crypto.randomUUID()}.${data.photo.name.split(".").pop()}`;
      const { error: photoUploadError } = await supabase.storage
        .from("cabinets")
        .upload(photoNamePath, data.photo, {
          contentType: data.photo.type,
          upsert: false,
          cacheControl: "3600",
        });

      if (photoUploadError) {
        throw new Error(`Upload Supabase échoué: ${photoUploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("cabinets")
        .getPublicUrl(photoNamePath);

      photoUrl = publicUrlData.publicUrl;
    }

    const { data: cabinet, error } = await supabase
      .from("cabinet")
      .insert({
        name: data.name,
        description: data.description,
        room_id: data.roomId,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating cabinet:", error);
      return { ok: false, error: "Erreur lors de la création de l'armoire." };
    }

    return { ok: true, cabinet };
  });
