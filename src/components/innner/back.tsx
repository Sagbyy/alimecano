import { Icon } from "@iconify/react";
import { Link, useRouter } from "@tanstack/react-router";

interface InnerBackProps {
  to: string;
  params?: Record<string, string | number>;
}

export function InnerBack({ to, params }: InnerBackProps) {
  const router = useRouter();

  return (
    <Link to={to} params={params}>
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
