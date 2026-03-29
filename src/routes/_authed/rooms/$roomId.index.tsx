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
import { Icon } from "@iconify/react";
import { getCabinetsByRoomId } from "#/server/cabinets";
import { deleteRoom, getRoomById } from "#/server/rooms";
import { Dialog, DialogContent, DialogTitle } from "#/components/ui/dialog";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/rooms/$roomId/")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [cabinets, room] = await Promise.all([
      getCabinetsByRoomId({ data: { roomId: parseInt(params.roomId) } }),
      getRoomById({ data: { roomId: parseInt(params.roomId) } }),
    ]);
    return { cabinets, room };
  },
});

function RouteComponent() {
  const { cabinets, room } = Route.useLoaderData();
  const { roomId } = Route.useParams();
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = Route.useNavigate();

  const filtered = cabinets?.filter((c) =>
    `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase()),
  );

  const totalParts =
    cabinets?.reduce((sum, c) => sum + (c.auto_part[0]?.count ?? 0), 0) ?? 0;

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack
          to="/"
          actionIcon="mdi:plus"
          onAction={() =>
            navigate({
              to: "/add/cabinet",
              search: { roomId: Number(roomId) },
            })
          }
          secondaryActionIcon="mdi:pencil"
          onSecondaryAction={() =>
            navigate({
              to: "/edit/room",
              search: { roomId: Number(roomId) },
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
              <BreadcrumbPage>{room?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-4">
          <h2 className="text-base font-semibold">Mes armoires</h2>
          <p className="text-xs text-neutral-400">
            {totalParts} pièce{totalParts > 1 ? "s" : ""} au total
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

        {cabinets == null ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Impossible de charger les cabinets.
          </p>
        ) : filtered?.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Aucun résultat.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {filtered?.map((cabinet) => (
              <li key={cabinet.id}>
                <Link
                  to="/rooms/$roomId/cabinets/$cabinetId"
                  params={{ roomId, cabinetId: cabinet.id.toString() }}
                >
                  <InnerCard
                    title={cabinet.name}
                    description={cabinet.description}
                    count={cabinet.auto_part[0]?.count ?? 0}
                    photo={cabinet.photo_url}
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
          Supprimer la salle
        </button>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogTitle>Supprimer la salle ?</DialogTitle>
            <p className="text-sm text-neutral-500 mt-1">
              Cette action est irréversible. La salle, toutes ses armoires, pièces et photos seront définitivement supprimées.
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
                  const result = await deleteRoom({ data: { roomId: Number(roomId) } });
                  if (result.ok) {
                    navigate({ to: "/" });
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
