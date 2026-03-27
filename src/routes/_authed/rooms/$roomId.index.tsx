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
import { getCabinets } from "#/server/cabinets";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/rooms/$roomId/")({
  component: RouteComponent,
  loader: () => getCabinets(),
});

function RouteComponent() {
  const cabinets = Route.useLoaderData();
  const { roomId } = Route.useParams();

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack to="/" />

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
