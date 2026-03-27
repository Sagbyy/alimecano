import { InnerBack } from "#/components/innner/back";
import { getAutoParts } from "#/server/auto-parts";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

export const Route = createFileRoute(
  "/_authed/rooms/$roomId/cabinets/$cabinetId/",
)({
  component: RouteComponent,
  loader: () => getAutoParts(),
});

function RouteComponent() {
  const autoParts = Route.useLoaderData();
  const { roomId, cabinetId } = Route.useParams();

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack
          to="/rooms/$roomId/cabinets/$cabinetId"
          params={{ roomId, cabinetId }}
        />
        <h2 className="text-base font-semibold mt-5">Mes pièces</h2>

        {autoParts == null ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Impossible de charger les pièces.
          </p>
        ) : autoParts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucune pièce.</p>
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
                  <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-gray-200 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {autoPart.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {autoPart.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Icon icon="mdi:barcode" className="h-3.5 w-3.5" />
                          {autoPart.reference}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Icon
                            icon="mdi:map-marker-outline"
                            className="h-3.5 w-3.5"
                          />
                          {autoPart.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {autoPart.price != null && (
                        <span className="bg-sky-100 text-sky-800 text-xs font-medium px-2 py-1 rounded-lg">
                          {autoPart.price} €
                        </span>
                      )}
                      <Icon
                        icon="mdi:chevron-right"
                        className="h-5 w-5 text-neutral-300"
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
