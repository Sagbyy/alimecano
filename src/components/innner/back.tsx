import { Icon } from "@iconify/react";
import { Link, useRouter } from "@tanstack/react-router";

export function InnerBack({ to }: { to: string }) {
  const router = useRouter();

  return (
    <Link to={to}>
      <div className="rounded-full shadow-sky-200 bg-sky-500 shadow-lg border w-fit">
        <Icon
          icon="mdi:arrow-left"
          className="h-5 w-5 text-white m-4"
          onClick={() => router.history.back()}
        />
      </div>
    </Link>
  );
}
