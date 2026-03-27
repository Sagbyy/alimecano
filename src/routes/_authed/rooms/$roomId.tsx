import { InnerCardComponent } from "#/components/innner/card";
import { getCabinets } from "#/server/cabinets";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/rooms/$roomId")({
  component: RouteComponent,
  loader: () => getCabinets(),
});

function RouteComponent() {
  const cabinets = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <h2 className="text-base font-semibold">Mes armoires</h2>

        {cabinets == null ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Impossible de charger les cabinets.
          </p>
        ) : cabinets.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune room.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {cabinets.map((cabinet) => (
              <li key={cabinet.id}>
                <Link
                  to="/rooms/$roomId"
                  params={{ roomId: cabinet.id.toString() }}
                >
                  <InnerCardComponent
                    title={cabinet.name}
                    description={cabinet.description}
                    count={cabinet.auto_part.length}
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
