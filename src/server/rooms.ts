import { createServerFn } from "@tanstack/react-start";
import "@tanstack/react-start/server-only";
import { z } from "zod";
import { getSupabaseServerClient } from "#/utils/supabase";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 5 Mo
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const roomIdSchema = z.object({
  roomId: z.number().int().positive(),
});

const createRoomSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  photo: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Fichier vide")
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image trop volumineuse")
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type),
      "Format non autorisé",
    ),
});

type RoomId = z.infer<typeof roomIdSchema>;

export const getRooms = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("room")
    .select("*, cabinet(auto_part(count))");

  if (error) {
    console.error("Error fetching rooms:", error);
    return null;
  }

  return data;
});

export const getRoomById = createServerFn({ method: "GET" })
  .inputValidator((data: RoomId) => roomIdSchema.parse(data))
  .handler(async ({ data: { roomId } }) => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("room")
      .select("*, cabinet(auto_part(count))")
      .eq("id", roomId)
      .single();

    if (error) {
      console.error(`Error fetching room ${roomId}:`, error);
      return null;
    }

    return data;
  });

const updateRoomSchema = z.object({
  roomId: z.number().int().positive(),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
});

export const updateRoom = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof updateRoomSchema>) =>
    updateRoomSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: room, error } = await supabase
      .from("room")
      .update({ name: data.name, description: data.description })
      .eq("id", data.roomId)
      .select()
      .single();

    if (error) {
      console.error("Error updating room:", error);
      return { ok: false, error: "Erreur lors de la mise à jour de la salle." };
    }

    return { ok: true, room };
  });

export const createRoom = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    const parsed = createRoomSchema.parse({
      name: data.get("name"),
      description: data.get("description"),
      photo: data.get("photo"),
    });

    return parsed;
  })
  .handler(async ({ data }: { data: z.infer<typeof createRoomSchema> }) => {
    const supabase = getSupabaseServerClient();
    const { name, description, photo } = data;

    const photoNamePath = `${Date.now()}-${crypto.randomUUID()}-${photo.name.split(".").pop()}`;

    const { error: photoUploadError } = await supabase.storage
      .from("rooms")
      .upload(photoNamePath, photo, {
        contentType: photo.type,
        upsert: false,
        cacheControl: "3600",
      });

    if (photoUploadError) {
      throw new Error(`Upload Supabase échoué: ${photoUploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(photoNamePath);

    const { data: room, error } = await supabase
      .from("room")
      .insert({ name, description, photo_url: publicUrlData.publicUrl })
      .select()
      .single();

    if (error) {
      console.error("Error creating room:", error);
      return { ok: false, error: "Erreur lors de la création de la salle." };
    }

    return { ok: true, room };
  });
