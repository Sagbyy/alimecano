import { InnerBack } from "#/components/innner/back";
import { InnerCard } from "#/components/innner/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "#/components/ui/breadcrumb";
import { Icon } from "@iconify/react";
import { getCabinets } from "#/server/cabinets";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/rooms/$roomId/")({
  component: RouteComponent,
  loader: () => getCabinets(),
});

function RouteComponent() {
  const cabinets = Route.useLoaderData();
  const { roomId } = Route.useParams();
  const [search, setSearch] = useState("");

  const filtered = cabinets?.filter((c) =>
    `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack to="/" actionIcon="mdi:plus" />

        <Breadcrumb className="mt-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Salle {roomId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h2 className="text-base font-semibold mt-4">Mes armoires</h2>

        <div className="relative mt-3">
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
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
