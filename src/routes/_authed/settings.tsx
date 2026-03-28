import { logoutFn } from "#/server/auth";
import { Icon } from "@iconify/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await logoutFn();
    if (response.ok)
      router.navigate({ to: "/login", search: { redirect: "/" } });
  };

  return (
    <main className="page-wrap px-4 pb-8">
      <section className="mt-8">
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 p-4 text-sm font-medium text-red-500"
        >
          <Icon icon="mdi:logout" className="h-5 w-5" />
          Se déconnecter
        </button>
      </section>
    </main>
  );
}
