import { createFileRoute, Link } from "@tanstack/react-router";
import { getRooms } from "#/server/rooms";
import { InnerCard } from "#/components/innner/card";
import { InnerLoader } from "#/components/innner/loader";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => getRooms(),
  pendingComponent: InnerLoader,
});

function Home() {
  const rooms = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 pb-8">
      <InnerLoader />
      <section className="mt-8">
        <h2 className="text-base font-semibold">Mes salles</h2>

        {rooms == null ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Impossible de charger les rooms.
          </p>
        ) : rooms.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune room.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rooms.map((room) => (
              <li key={room.id}>
                <Link
                  to="/rooms/$roomId"
                  params={{ roomId: room.id.toString() }}
                >
                  <InnerCard
                    title={room.name}
                    description={room.description}
                    count={
                      room.cabinet.map((cabinet) => cabinet.auto_part).length
                    }
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
