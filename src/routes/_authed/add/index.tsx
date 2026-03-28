import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <h2 className="text-base font-semibold">Ajouter</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Que souhaitez-vous ajouter ?
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <AddCard
            icon="mdi:home-outline"
            label="Salle"
            description="Ajouter une nouvelle salle"
            to="/add/room"
          />
          <AddCard
            icon="mdi:wardrobe-outline"
            label="Armoire"
            description="Ajouter une armoire dans une salle"
            to="/add/cabinet"
          />
          <AddCard
            icon="mdi:cog-outline"
            label="Pièce automobile"
            description="Ajouter une pièce dans une armoire"
            to="/add/auto-part"
          />
        </div>
      </section>
    </main>
  );
}

function AddCard({
  icon,
  label,
  description,
  to,
}: {
  icon: string;
  label: string;
  description: string;
  to: string;
}) {
  return (
    <Link to={to}>
      <div className="flex items-center gap-4 rounded-xl border-2 border-gray-200 bg-white p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 shrink-0">
          <Icon icon={icon} className="h-6 w-6 text-sky-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-neutral-400">{description}</p>
        </div>
        <Icon
          icon="mdi:chevron-right"
          className="h-5 w-5 text-neutral-300 shrink-0"
        />
      </div>
    </Link>
  );
}
