import { createServerFn } from "@tanstack/react-start";
import "@tanstack/react-start/server-only";
import { z } from "zod";
import { getSupabaseServerClient } from "#/utils/supabase";

const roomIdSchema = z.object({
  roomId: z.number().int().positive(),
});

const createRoomSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
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
  .inputValidator((data: z.infer<typeof createRoomSchema>) =>
    createRoomSchema.parse(data),
  )
  .handler(async ({ data: { name, description } }) => {
    const supabase = getSupabaseServerClient();
    const { data: room, error } = await supabase
      .from("room")
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      console.error("Error creating room:", error);
      return { ok: false, error: "Erreur lors de la création de la salle." };
    }

    return { ok: true, room };
  });
