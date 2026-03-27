import { InnerBack } from "#/components/innner/back";
import { InnerCard } from "#/components/innner/card";
import { InnerLoader } from "#/components/innner/loader";
import { getAutoParts } from "#/server/auto-parts";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authed/rooms/$roomId/cabinets/$cabinetId/",
)({
  component: RouteComponent,
  loader: () => getAutoParts(),
  pendingComponent: InnerLoader,
});

function RouteComponent() {
  const autoParts = Route.useLoaderData();
  const { roomId, cabinetId } = Route.useParams();

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack to="/ro" />
        <h2 className="text-base font-semibold mt-5">Mes armoires</h2>
        {autoParts == null ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Impossible de charger les cabinets.
          </p>
        ) : autoParts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune room.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {autoParts.map((autoPart) => (
              <li key={autoPart.id}>
                <Link
                  to="/rooms/$roomId/cabinets/$cabinetId/auto-parts/$autoPartId"
                  params={{
                    roomId,
                    cabinetId,
                    autoPartId: autoPart.id.toString(),
                  }}
                >
                  <InnerCard
                    title={autoPart.name}
                    description={autoPart.description}
                    count={autoPart.auto_part.length}
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
