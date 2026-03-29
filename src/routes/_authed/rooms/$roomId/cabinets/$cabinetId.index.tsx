import { InnerBack } from "#/components/inner/back";
import { InnerCard } from "#/components/inner/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { getAutoPartsByCabinetId } from "#/server/auto-parts";
import { deleteCabinet, getCabinetById } from "#/server/cabinets";
import { getRoomById } from "#/server/rooms";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authed/rooms/$roomId/cabinets/$cabinetId/",
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [autoParts, cabinet, room] = await Promise.all([
      getAutoPartsByCabinetId({
        data: { cabinetId: parseInt(params.cabinetId) },
      }),
      getCabinetById({ data: { cabinetId: parseInt(params.cabinetId) } }),
      getRoomById({ data: { roomId: parseInt(params.roomId) } }),
    ]);

    return { autoParts, cabinet, room };
  },
});

function RouteComponent() {
  const { autoParts, cabinet, room } = Route.useLoaderData();
  const { roomId, cabinetId } = Route.useParams();
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = Route.useNavigate();

  const filtered = autoParts?.filter((p) =>
    `${p.name} ${p.description} ${p.reference}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack
          to="/rooms/$roomId/"
          params={{ roomId }}
          actionIcon="mdi:plus"
          onAction={() =>
            navigate({
              to: "/add/auto-part",
              search: { cabinetId: Number(cabinetId) },
            })
          }
          secondaryActionIcon="mdi:pencil"
          onSecondaryAction={() =>
            navigate({
              to: "/edit/cabinet",
              search: { cabinetId: Number(cabinetId), roomId },
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
              <BreadcrumbPage>
                {cabinet?.name || `Armoire ${cabinetId}`}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-4">
          <h2 className="text-base font-semibold">Mes pièces</h2>
          <p className="text-xs text-neutral-400">
            {autoParts?.length ?? 0} pièce
            {(autoParts?.length ?? 0) > 1 ? "s" : ""} au total
          </p>
        </div>

        <div className="relative mt-3">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
          />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sky-400"
          />
        </div>

        {autoParts == null ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Impossible de charger les pièces.
          </p>
        ) : filtered?.length === 0 ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Aucune pièce dans cet armoire.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {filtered?.map((autoPart) => (
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
                    reference={autoPart.reference}
                    location={autoPart.location}
                    price={autoPart.price}
                    photo={autoPart.photo_url}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          <Icon icon="mdi:trash-can-outline" className="h-4 w-4" />
          Supprimer l'armoire
        </button>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogTitle>Supprimer l'armoire ?</DialogTitle>
            <p className="text-sm text-neutral-500 mt-1">
              Cette action est irréversible. L'armoire, toutes ses pièces et
              leurs photos seront définitivement supprimées.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 rounded-xl border-2 border-gray-200 py-2.5 text-sm font-medium text-neutral-600"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  const result = await deleteCabinet({
                    data: { cabinetId: Number(cabinetId) },
                  });
                  if (result.ok) {
                    navigate({ to: "/rooms/$roomId", params: { roomId } });
                  }
                  setIsDeleting(false);
                }}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
}
