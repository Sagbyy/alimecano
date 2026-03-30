import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getSupabaseAdminClient,
  getSupabaseServerClient,
} from "#/utils/supabase";

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
  photo: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image trop volumineuse")
    .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), "Format non autorisé")
    .optional(),
});

export const updateRoom = createServerFn({ method: "POST" })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const photoFile = data.get("photo");
    return updateRoomSchema.parse({
      roomId: Number(data.get("roomId")),
      name: data.get("name"),
      description: data.get("description"),
      photo: photoFile instanceof File && photoFile.size > 0 ? photoFile : undefined,
    });
  })
  .handler(async ({ data }: { data: z.infer<typeof updateRoomSchema> }) => {
    const supabase = getSupabaseAdminClient();

    let photoUrl: string | undefined;

    if (data.photo) {
      const { data: existing } = await supabase
        .from("room").select("photo_url").eq("id", data.roomId).single();

      if (existing?.photo_url) {
        const old = new URL(existing.photo_url).pathname.split("/rooms/")[1];
        if (old) await supabase.storage.from("rooms").remove([old]);
      }

      const path = `${Date.now()}-${crypto.randomUUID()}.${data.photo.name.split(".").pop()}`;
      await supabase.storage.from("rooms").upload(path, data.photo, {
        contentType: data.photo.type, upsert: false, cacheControl: "3600",
      });
      photoUrl = supabase.storage.from("rooms").getPublicUrl(path).data.publicUrl;
    }

    const { data: room, error } = await supabase
      .from("room")
      .update({
        name: data.name,
        description: data.description,
        updated_at: new Date().toISOString(),
        ...(photoUrl !== undefined && { photo_url: photoUrl }),
      })
      .eq("id", data.roomId)
      .select()
      .single();

    if (error) {
      console.error("Error updating room:", error);
      return { ok: false, error: "Erreur lors de la mise à jour de la salle." };
    }

    return { ok: true, room };
  });

export const deleteRoom = createServerFn({ method: "POST" })
  .inputValidator((data: RoomId) => roomIdSchema.parse(data))
  .handler(async ({ data: { roomId } }) => {
    const supabase = getSupabaseAdminClient();

    const { data: room, error: roomFetchError } = await supabase
      .from("room")
      .select("photo_url, cabinet(id, photo_url, auto_part(id, photo_url))")
      .eq("id", roomId)
      .single();

    if (roomFetchError) {
      console.error("Error fetching room for deletion:", roomFetchError);
      return { ok: false, error: "Salle introuvable." };
    }

    const autoPartPhotoPaths = room.cabinet
      .flatMap((c) => c.auto_part)
      .map((p) => {
        if (!p.photo_url) return null;
        const pathParts = new URL(p.photo_url).pathname.split("/auto-parts/");
        return pathParts[1] ?? null;
      })
      .filter((p): p is string => p !== null);

    if (autoPartPhotoPaths.length > 0) {
      await supabase.storage.from("auto-parts").remove(autoPartPhotoPaths);
    }

    const cabinetIds = room.cabinet.map((c) => c.id);
    if (cabinetIds.length > 0) {
      await supabase.from("auto_part").delete().in("cabinet_id", cabinetIds);
    }

    const cabinetPhotoPaths = room.cabinet
      .map((c) => {
        if (!c.photo_url) return null;
        const pathParts = new URL(c.photo_url).pathname.split("/cabinets/");
        return pathParts[1] ?? null;
      })
      .filter((p): p is string => p !== null);

    if (cabinetPhotoPaths.length > 0) {
      await supabase.storage.from("cabinets").remove(cabinetPhotoPaths);
    }

    await supabase.from("cabinet").delete().eq("room_id", roomId);

    if (room.photo_url) {
      const pathParts = new URL(room.photo_url).pathname.split("/rooms/");
      if (pathParts[1]) {
        await supabase.storage.from("rooms").remove([pathParts[1]]);
      }
    }

    const { error } = await supabase.from("room").delete().eq("id", roomId);

    if (error) {
      console.error("Error deleting room:", error);
      return { ok: false, error: "Erreur lors de la suppression de la salle." };
    }

    return { ok: true };
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
    const supabase = getSupabaseAdminClient();
    const { name, description, photo } = data;

    const photoNamePath = `${Date.now()}-${crypto.randomUUID()}.${photo.name.split(".").pop()}`;

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
      .from("rooms")
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
