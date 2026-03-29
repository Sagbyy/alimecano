import { InnerCard } from "#/components/inner/card";
import { getAutoParts, searchAutoParts } from "#/server/auto-parts";
import { Icon } from "@iconify/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type SubmitEvent } from "react";
import { z } from "zod";

const searchParamsSchema = z.object({
  query: z.string().default(""),
});

export const Route = createFileRoute("/_authed/search")({
  validateSearch: searchParamsSchema,
  loaderDeps: ({ search }) => ({ query: search.query }),
  loader: ({ deps: { query } }) =>
    query.trim().length >= 2
      ? searchAutoParts({ data: { query: query.trim() } })
      : getAutoParts(),
  component: SearchPage,
});

function SearchPage() {
  const results = Route.useLoaderData();
  const { query } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const formRef = useRef<HTMLFormElement>(null);

  const [inputValue, setInputValue] = useState(query);

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    navigate({ search: { query: inputValue }, replace: true });
  };

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <h2 className="text-base font-semibold">Recherche</h2>

        <div className="relative mt-3">
          <form onSubmit={onSubmit} ref={formRef}>
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
              onClick={() => formRef.current?.requestSubmit()}
            />
            <input
              type="text"
              placeholder="Nom, référence, emplacement..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sky-400"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Icon
                  icon="mdi:close-circle"
                  className="h-4 w-4 text-neutral-300"
                />
              </button>
            )}
          </form>
        </div>

        {query.trim().length > 0 && query.trim().length < 2 ? (
          <p className="mt-4 text-sm text-neutral-400">
            Entrez au moins 2 caractères.
          </p>
        ) : results == null ? (
          <p className="mt-4 text-sm text-neutral-400">
            Erreur lors de la recherche.
          </p>
        ) : results.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400">
            Aucune pièce trouvée pour{" "}
            <span className="font-medium">"{query}"</span>.
          </p>
        ) : (
          <div className="mt-4">
            <p className="text-xs text-neutral-400 mb-2">
              {results.length} pièce{results.length > 1 ? "s" : ""}
              {query.trim().length >= 2 ? ` pour "${query}"` : ""}
            </p>
            <ul className="space-y-2">
              {results.map((part) => (
                <li key={part.id}>
                  <Link
                    to="/rooms/$roomId/cabinets/$cabinetId/auto-parts/$autoPartId"
                    params={{
                      roomId: String(part.cabinet.room.id),
                      cabinetId: String(part.cabinet.id),
                      autoPartId: String(part.id),
                    }}
                  >
                    <InnerCard
                      title={part.name}
                      description={part.description}
                      reference={part.reference}
                      location={part.location}
                      price={part.price}
                      photo={part.photo_url}
                    />
                    <p className="text-xs text-neutral-400 mt-1 ml-1"></p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
