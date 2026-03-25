import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { logoutFn } from '../server/auth'
import { getRooms } from '#/server/rooms'

export const Route = createFileRoute('/')({
  component: Home,
  loader: () => getRooms(),
})

function Home() {
  const navigate = useNavigate()
  const { user } = Route.useRouteContext()
  const rooms = Route.useLoaderData()
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

      <section className="mt-8">
        <h2 className="text-base font-semibold">Rooms</h2>

        {rooms == null ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Impossible de charger les rooms.
          </p>
        ) : rooms.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune room.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rooms.map((room) => (
              <li key={room.id} className="rounded-md border px-3 py-2">
                <div className="font-medium">{room.name}</div>
                <div className="text-xs text-muted-foreground">
                  #{room.id} · {new Date(room.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
