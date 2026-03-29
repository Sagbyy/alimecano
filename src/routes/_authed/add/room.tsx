import { InnerBack } from "#/components/innner/back";
import { FieldError } from "#/components/ui/field";
import { createRoom } from "#/server/rooms";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  photo: z
    .instanceof(File)
    .refine(
      (file) => file.type.startsWith("image/"),
      "Le fichier doit être une image",
    ),
});

export const Route = createFileRoute("/_authed/add/room")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      photo: new File([], ""),
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append("name", value.name);
      formData.append("description", value.description);
      formData.append("photo", value.photo);

      const result = await createRoom({ data: formData });
      if (result?.ok) {
        navigate({ to: "/" });
      }
    },
  });

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <InnerBack to="/add" />

        <h2 className="text-base font-semibold mt-4">Nouvelle salle</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Renseignez les informations de la salle
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

          <form.Field
            name="photo"
            children={(field) => {
              const handleFileChange = (
                e: React.ChangeEvent<HTMLInputElement>,
              ) => {
                const file = e.target.files?.[0];
                if (file) {
                  field.handleChange(file);
                }
              };

              return (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor={field.name}>
                    Photo
                  </label>
                  <input
                    id={field.name}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    onBlur={field.handleBlur}
                    className="w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-2 file:border-gray-200 file:bg-white file:px-4 file:py-2.5 file:text-sm file:font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
                  />
                  <FieldError errors={field.state.meta.errors} />
                </div>
              );
            }}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 disabled:opacity-50"
              >
                {isSubmitting ? "Création..." : "Créer la salle"}
              </button>
            )}
          />
        </form>
      </section>
    </main>
  );
}
