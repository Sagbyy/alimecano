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
  roomId: z.number().int().positive(),
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

export const createRoom = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof createRoomSchema>) =>
    createRoomSchema.parse(data),
  )
  .handler(async ({ data: { name, description, roomId } }) => {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
      .from("cabinet")
      .insert({ name, description, room_id: roomId });

    if (error) {
      console.error("Error creating room:", error);
      return null;
    }
  });
