import { createServerFn } from '@tanstack/react-start'

import { z } from 'zod'
import { getSupabaseServerClient } from '../utils/supabase'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) return { ok: false, error: error.message }

    return {
      ok: true,
      user: result.user,
    }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  await supabase.auth.signOut()
  return { ok: true }
})

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ?? null
})

