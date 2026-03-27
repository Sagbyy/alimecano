import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  redirect,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { getCurrentUserFn } from "../server/auth";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/login") return {};

    const user = await getCurrentUserFn();
    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const showBottomNav = pathname !== "/login";

  const navItems = [
    {
      to: "/",
      label: "ACCUEIL",
      icon: "mdi:home-outline",
      activeIcon: "mdi:home",
    },
    {
      to: "/search",
      label: "RECHERCHE",
      icon: "mdi:magnify",
      activeIcon: "mdi:magnify",
    },
    {
      to: "/add",
      label: "AJOUTER",
      icon: "mdi:plus-circle-outline",
      activeIcon: "mdi:plus-circle",
    },
    {
      to: "/settings",
      label: "PROFIL",
      icon: "mdi:account-outline",
      activeIcon: "mdi:account",
    },
  ] as const;

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#fafbfc]">
        <div className={showBottomNav ? "pb-24" : undefined}>
          <Outlet />
        </div>
        {/*<TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />*/}
        {showBottomNav ? (
          <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-sm rounded-full border border-[#d9dce1] bg-[#f7f8fa] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            <ul className="grid grid-cols-4 gap-1">
              {navItems.map((item) => {
                const otherTabs = ["/search", "/add", "/settings"];
                const isActive =
                  item.to === "/"
                    ? !otherTabs.some((p) => pathname.startsWith(p))
                    : pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex h-14 flex-col items-center justify-center rounded-full text-[10px] font-medium tracking-[0.08em] transition-colors ${
                        isActive
                          ? "bg-sky-500 text-white"
                          : "text-[#9aa0aa] hover:text-[#6c727d]"
                      }`}
                    >
                      <Icon
                        icon={isActive ? item.activeIcon : item.icon}
                        className="h-5 w-5"
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}
