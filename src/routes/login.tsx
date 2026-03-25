import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { getCurrentUserFn, loginFn } from '../server/auth'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : '/',
  }),
  beforeLoad: async ({ search }) => {
    const user = await getCurrentUserFn()
    if (user) {
      throw redirect({ to: '/', replace: true, search })
    }
  },
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const { redirect: redirectTo } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () => email.trim().length > 0 && password.trim().length > 0 && !isSubmitting,
    [email, password, isSubmitting],
  )

  async function onSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await loginFn({
        data: { email: email.trim(), password },
      })
      if (!result.ok) {
        setError(result.error)
        return
      }

      await navigate({ to: redirectTo })
    } catch {
      setError('Une erreur est survenue. Réessaie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Connecte-toi pour accéder au site.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={!canSubmit}>
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </main>
  )
}

