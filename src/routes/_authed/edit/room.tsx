import { InnerBack } from "#/components/inner/back";
import { FieldError } from "#/components/ui/field";
import { getRoomById, updateRoom } from "#/server/rooms";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  roomId: z.number().int().positive(),
});

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
});

export const Route = createFileRoute("/_authed/edit/room")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ roomId: search.roomId }),
  loader: ({ deps: { roomId } }) => getRoomById({ data: { roomId } }),
  component: RouteComponent,
});

function RouteComponent() {
  const room = Route.useLoaderData();
  const { roomId } = Route.useSearch();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: room?.name ?? "",
      description: room?.description ?? "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateRoom({
        data: { roomId, ...value },
      });
      if (result?.ok) {
        navigate({
          to: "/rooms/$roomId/",
          params: { roomId: String(roomId) },
        });
      }
    },
  });

  if (!room) {
    return (
      <main className="page-wrap px-4 pb-8">
        <section className="mt-8">
          <InnerBack to="/" />
          <p className="mt-6 text-sm text-muted-foreground">
            Salle introuvable.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack to="/rooms/$roomId/" params={{ roomId: String(roomId) }} />

        <h2 className="text-base font-semibold mt-4">Modifier la salle</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Modifiez les informations de la salle
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="name"
            children={(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={field.name}>
                  Nom
                </label>
                <input
                  id={field.name}
                  type="text"
                  placeholder="Ex: Garage principal"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-400"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          />

          <form.Field
            name="description"
            children={(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={field.name}>
                  Description
                </label>
                <textarea
                  id={field.name}
                  placeholder="Ex: Salle de stockage principale"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  rows={3}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-400 resize-none"
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 disabled:opacity-50"
              >
                {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            )}
          />
        </form>
      </section>
    </main>
  );
}
