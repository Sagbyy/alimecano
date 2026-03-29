import { InnerBack } from "#/components/innner/back";
import { FieldError } from "#/components/ui/field";
import { getAutoPartById, updateAutoPart } from "#/server/auto-parts";
import { Icon } from "@iconify/react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

const searchSchema = z.object({
  autoPartId: z.number().int().positive(),
  roomId: z.string(),
  cabinetId: z.string(),
});

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  reference: z.string().min(1, "La référence est requise"),
  location: z.string().min(1, "L'emplacement est requis"),
  price: z
    .string()
    .refine(
      (v) =>
        !Number.isNaN(Number(v.replace(",", "."))) &&
        Number(v.replace(",", ".")) >= 0,
      "Le prix doit être positif",
    ),
  compatibleVehicles: z.array(z.string()),
});

export const Route = createFileRoute("/_authed/edit/auto-part")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ autoPartId: search.autoPartId }),
  loader: ({ deps: { autoPartId } }) =>
    getAutoPartById({ data: { autoPartId } }),
  component: RouteComponent,
});

function RouteComponent() {
  const autoPart = Route.useLoaderData();
  const { autoPartId, roomId, cabinetId } = Route.useSearch();
  const navigate = useNavigate();
  const [vehicleInput, setVehicleInput] = useState("");

  const form = useForm({
    defaultValues: {
      name: autoPart?.name ?? "",
      description: autoPart?.description ?? "",
      reference: autoPart?.reference ?? "",
      location: autoPart?.location ?? "",
      price: autoPart?.price != null ? String(autoPart.price) : "",
      compatibleVehicles: autoPart?.compatible_vehicle ?? ([] as string[]),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateAutoPart({
        data: {
          autoPartId,
          ...value,
          price: Number(value.price.replace(",", ".")),
        },
      });
      if (result?.ok) {
        navigate({
          to: "/rooms/$roomId/cabinets/$cabinetId/auto-parts/$autoPartId",
          params: { roomId, cabinetId, autoPartId: String(autoPartId) },
        });
      }
    },
  });

  if (!autoPart) {
    return (
      <main className="page-wrap px-4 pb-8">
        <section className="mt-8">
          <InnerBack to="/search" />
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
          to="/rooms/$roomId/cabinets/$cabinetId/auto-parts/$autoPartId"
          params={{ roomId, cabinetId, autoPartId: String(autoPartId) }}
        />

        <h2 className="text-base font-semibold mt-4">Modifier la pièce</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Modifiez les informations de la pièce
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
                  placeholder="Ex: Filtre à huile"
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
            name="reference"
            children={(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={field.name}>
                  Référence
                </label>
                <input
                  id={field.name}
                  type="text"
                  placeholder="Ex: OC90"
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
            name="location"
            children={(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={field.name}>
                  Emplacement
                </label>
                <input
                  id={field.name}
                  type="text"
                  placeholder="Ex: Étagère 2, rangée A"
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
            name="price"
            children={(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={field.name}>
                  Prix (€)
                </label>
                <input
                  id={field.name}
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 12.99"
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
            name="compatibleVehicles"
            children={(field) => (
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium"
                  htmlFor="compatibleVehicles"
                >
                  Véhicules compatibles
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Peugeot 308 1.6 HDi"
                    value={vehicleInput}
                    onChange={(e) => setVehicleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = vehicleInput.trim();
                        if (trimmed && !field.state.value.includes(trimmed)) {
                          field.handleChange([...field.state.value, trimmed]);
                          setVehicleInput("");
                        }
                      }
                    }}
                    className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = vehicleInput.trim();
                      if (trimmed && !field.state.value.includes(trimmed)) {
                        field.handleChange([...field.state.value, trimmed]);
                        setVehicleInput("");
                      }
                    }}
                    className="rounded-xl bg-sky-100 px-4 py-2.5 text-sm font-medium text-sky-600"
                  >
                    Ajouter
                  </button>
                </div>
                {field.state.value.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mt-1">
                    {field.state.value.map((vehicle) => (
                      <li
                        key={vehicle}
                        className="flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs text-sky-700"
                      >
                        {vehicle}
                        <button
                          type="button"
                          onClick={() =>
                            field.handleChange(
                              field.state.value.filter((v) => v !== vehicle),
                            )
                          }
                          className="ml-1 text-sky-400 hover:text-sky-700"
                        >
                          <Icon icon="mdi:close" className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
                  placeholder="Ex: Filtre à huile compatible moteur 1.6 HDi"
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
