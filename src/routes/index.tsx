import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { logoutFn } from '../server/auth'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const { user } = Route.useRouteContext()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Espace privé</h1>
          {user?.email ? (
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          ) : null}
        </div>

        <Button
          variant="outline"
          onClick={async () => {
            if (isLoggingOut) return
            setIsLoggingOut(true)
            await logoutFn()
            await navigate({ to: '/login', search: { redirect: '/' } })
          }}
          type="button"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Déconnexion…' : 'Se déconnecter'}
        </Button>
      </div>
    </main>
  )
}
