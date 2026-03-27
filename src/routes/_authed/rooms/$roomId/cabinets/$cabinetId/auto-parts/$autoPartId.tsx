import { InnerBack } from "#/components/innner/back";
import { getAutoPartById } from "#/server/auto-parts";
import { createFileRoute } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

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

        <h2 className="text-lg font-semibold mt-5">{autoPart.name}</h2>
        <p className="text-sm text-neutral-500 mt-1">{autoPart.description}</p>

        <div className="mt-6 space-y-3">
          <InfoRow icon="mdi:barcode" label="Référence" value={autoPart.reference} />
          <InfoRow icon="mdi:map-marker-outline" label="Emplacement" value={autoPart.location} />
          {autoPart.price != null && (
            <InfoRow
              icon="mdi:currency-eur"
              label="Prix"
              value={`${autoPart.price} €`}
            />
          )}
          {autoPart.compatible_vehicle && autoPart.compatible_vehicle.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border-2 border-gray-200 p-4">
              <Icon icon="mdi:car-outline" className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400 mb-1">Véhicules compatibles</p>
                <div className="flex flex-wrap gap-2">
                  {autoPart.compatible_vehicle.map((v) => (
                    <span
                      key={v}
                      className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-lg"
                    >
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 p-4">
      <Icon icon={icon} className="h-5 w-5 text-sky-500 shrink-0" />
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
