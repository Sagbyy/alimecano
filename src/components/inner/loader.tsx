import { Icon } from "@iconify/react";

export function InnerLoader() {
  return (
    <Icon
      icon="game-icons:car-wheel"
      className="animate-spin h-10 w-10 text-sky-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    />
  );
}
