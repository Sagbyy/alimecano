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
  const navigate = Route.useNavigate();

  const totalParts =
    rooms?.reduce(
      (sum, room) =>
        sum +
        room.cabinet.reduce((s, c) => s + (c.auto_part[0]?.count ?? 0), 0),
      0,
    ) ?? 0;

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Mes salles</h2>
            <p className="text-xs text-neutral-400">
              {totalParts} pièce{totalParts > 1 ? "s" : ""} au total
            </p>
          </div>
          <InnerActionButton
            icon="mdi:plus"
            onClick={() => navigate({ to: "/add/room" })}
          />
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
                    count={room.cabinet.reduce(
                      (sum, c) => sum + (c.auto_part[0]?.count ?? 0),
                      0,
                    )}
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
