import { createServerFn } from "@tanstack/react-start";

import { z } from "zod";
import { getSupabaseServerClient } from "../utils/supabase";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      switch (error.status) {
        case 400:
          return {
            ok: false,
            error: "L'identifiant ou le mot de passe est incorrect.",
          };
        case 429:
          return {
            ok: false,
            error: "Trop de tentatives. Réessaie dans quelques instants.",
          };
        default:
          return {
            ok: false,
            error: "Une erreur est survenue. Réessaie.",
          };
      }
    }

    return {
      ok: true,
      user: result.user,
    };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  return { ok: true };
});

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  },
);
