import { InnerBack } from "#/components/inner/back";
import { InnerRow } from "#/components/inner/row";
import { InnerTags } from "#/components/inner/tags";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { getAutoPartById } from "#/server/auto-parts";
import { getCabinetById } from "#/server/cabinets";
import { getRoomById } from "#/server/rooms";
import { Dialog, DialogContent } from "#/components/ui/dialog";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authed/rooms/$roomId/cabinets/$cabinetId/auto-parts/$autoPartId",
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [autoPart, cabinet, room] = await Promise.all([
      getAutoPartById({ data: { autoPartId: parseInt(params.autoPartId) } }),
      getCabinetById({ data: { cabinetId: parseInt(params.cabinetId) } }),
      getRoomById({ data: { roomId: parseInt(params.roomId) } }),
    ]);
    return { autoPart, cabinet, room };
  },
});

function RouteComponent() {
  const { autoPart, cabinet, room } = Route.useLoaderData();
  const { roomId, cabinetId, autoPartId } = Route.useParams();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

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
          actionIcon="mdi:pencil"
          onAction={() =>
            navigate({
              to: "/edit/auto-part",
              search: { autoPartId: parseInt(autoPartId), roomId, cabinetId },
            })
          }
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
                  {room?.name || `Salle ${roomId}`}
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
                  {cabinet?.name || `Armoire ${cabinetId}`}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{autoPart.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {autoPart.photo_url && (
          <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent
                className="max-w-3xl p-2 bg-transparent border-none shadow-none"
                showCloseButton={true}
              >
                <img
                  src={autoPart.photo_url}
                  alt="Aperçu plein écran"
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
              </DialogContent>
            </Dialog>
            <div className="mt-4 rounded-xl overflow-hidden border-2 border-gray-200">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={autoPart.photo_url}
                  alt={autoPart.name}
                  className="h-full w-full object-cover cursor-zoom-in"
                  onClick={() => setDialogOpen(true)}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.removeAttribute("hidden");
                  }}
                />
                <div hidden className="h-full w-full flex items-center justify-center bg-gray-100">
                  <span className="text-xs text-gray-400">Image indisponible</span>
                </div>
              </AspectRatio>
            </div>
          </>
        )}

        <h2 className="text-lg font-semibold mt-4">{autoPart.name}</h2>
        <p className="text-sm text-neutral-500 mt-1">{autoPart.description}</p>

        <div className="mt-6 space-y-3">
          <InnerRow
            icon="mdi:barcode"
            label="Référence"
            value={autoPart.reference}
          />
          <InnerRow
            icon="mdi:map-marker-outline"
            label="Emplacement"
            value={autoPart.location}
          />
          {autoPart.price != null && (
            <InnerRow
              icon="mdi:currency-eur"
              label="Prix"
              value={`${autoPart.price} €`}
            />
          )}
          {autoPart.compatible_vehicle && (
            <InnerTags
              icon="mdi:car-outline"
              label="Véhicules compatibles"
              tags={autoPart.compatible_vehicle}
            />
          )}
        </div>
      </section>
    </main>
  );
}
