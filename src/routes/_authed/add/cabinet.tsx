import { InnerBack } from "#/components/inner/back";
import { FieldError } from "#/components/ui/field";
import { createCabinet } from "#/server/cabinets";
import { getRooms } from "#/server/rooms";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  roomId: z.number().int().positive("Sélectionnez une salle"),
});

const searchSchema = z.object({
  roomId: z.number().int().positive().catch(0),
});

export const Route = createFileRoute("/_authed/add/cabinet")({
  validateSearch: searchSchema,
  loader: () => getRooms(),
  component: RouteComponent,
});

function RouteComponent() {
  const rooms = Route.useLoaderData();
  const { roomId } = Route.useSearch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      roomId: roomId,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Submitting form with value:", value);
      const result = await createCabinet({ data: value });
      if (result.ok) {
        navigate({
          to: "/rooms/$roomId",
          params: { roomId: String(value.roomId) },
        });
      } else setErrorMessage(result.error);
    },
  });

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack to="/add" />

        <h2 className="text-base font-semibold mt-4">Nouvelle armoire</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Renseignez les informations de l'armoire
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="roomId"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;

              return (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor={field.name}>
                    Salle
                  </label>
                  <select
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    onBlur={field.handleBlur}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-400"
                  >
                    <option value={0} disabled>
                      Choisir une salle...
                    </option>
                    {rooms?.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              );
            }}
          />

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
                  placeholder="Ex: Armoire principale"
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
                  placeholder="Ex: Armoire du fond à gauche"
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
                {isSubmitting ? "Création..." : "Créer l'armoire"}
              </button>
            )}
          />
          {errorMessage && (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
