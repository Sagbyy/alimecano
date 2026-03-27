import { InnerActionButton } from "#/components/innner/action-button";
import { InnerCard } from "#/components/innner/card";
import { getRooms } from "#/server/rooms";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => getRooms(),
});

function Home() {
  const rooms = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Mes salles</h2>
          <InnerActionButton icon="mdi:plus" />
        </div>

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
