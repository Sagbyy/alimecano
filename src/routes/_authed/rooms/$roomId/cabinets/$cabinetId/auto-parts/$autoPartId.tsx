import { InnerBack } from "#/components/innner/back";
import { InnerRow } from "#/components/innner/row";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { getAutoPartById } from "#/server/auto-parts";
import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authed/rooms/$roomId/cabinets/$cabinetId/auto-parts/$autoPartId",
)({
  component: RouteComponent,
  loader: ({ params }) =>
    getAutoPartById({ data: { autoPartId: parseInt(params.autoPartId) } }),
});

function RouteComponent() {
  const autoPart = Route.useLoaderData();
  const { roomId, cabinetId } = Route.useParams();

  if (!autoPart) {
    return (
      <main className="page-wrap px-4 pb-8">
        <section className="mt-8">
          <InnerBack
            to="/rooms/$roomId/cabinets/$cabinetId/"
            params={{ roomId, cabinetId }}
          />
          <p className="mt-6 text-sm text-muted-foreground">
            Pièce introuvable.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack
          to="/rooms/$roomId/cabinets/$cabinetId/"
          params={{ roomId, cabinetId }}
        />

        <Breadcrumb className="mt-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/rooms/$roomId" params={{ roomId }}>
                  Salle {roomId}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/rooms/$roomId/cabinets/$cabinetId"
                  params={{ roomId, cabinetId }}
                >
                  Armoire {cabinetId}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{autoPart.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="relative mt-4">
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sky-400"
          />
        </div>

        <h2 className="text-lg font-semibold mt-4">{autoPart.name}</h2>
        <p className="text-sm text-neutral-500 mt-1">{autoPart.description}</p>

        <div className="mt-6 space-y-3">
          <InnerRow icon="mdi:barcode" label="Référence" value={autoPart.reference} />
          <InnerRow icon="mdi:map-marker-outline" label="Emplacement" value={autoPart.location} />
          {autoPart.price != null && (
            <InnerRow icon="mdi:currency-eur" label="Prix" value={`${autoPart.price} €`} />
          )}
          {autoPart.compatible_vehicle && autoPart.compatible_vehicle.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border-2 border-gray-200 p-4">
              <Icon icon="mdi:car-outline" className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400 mb-1">Véhicules compatibles</p>
                <div className="flex flex-wrap gap-2">
                  {autoPart.compatible_vehicle.map((v) => (
                    <span key={v} className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-lg">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
