import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getRooms } from "#/server/rooms";
import { Button } from "../components/ui/button";
import { logoutFn } from "../server/auth";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => getRooms(),
});

function Home() {
  const navigae = useNavigate();
  const { user } = Route.useRouteContext();
  const rooms = Route.useLoaderData();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <main className="page-wrap px-4 pb-8">
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
              <li
                key={room.id}
                className="text-xs md:text-base flex items-center justify-between gap-4 rounded-xl border-2 border-gray-200 p-4"
              >
                <div>
                  <p className="text-base font-semibold">{room.name}</p>
                  <p>Armoire 1, Armoire 2, Armoire 3</p>
                </div>
                <p className="bg-blue-100 py-2 px-3 rounded-lg text-blue-700">
                  {room.cabinet.map((cabinet) => cabinet.auto_part).length ||
                    0}{" "}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
