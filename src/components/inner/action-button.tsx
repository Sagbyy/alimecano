import { Icon } from "@iconify/react";

interface InnerActionButtonProps {
  icon: string;
  onClick?: () => void;
}

export function InnerActionButton({ icon, onClick }: InnerActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center rounded-full bg-sky-500 shadow-lg shadow-sky-200 border w-[52px] h-[52px] shrink-0"
    >
      <Icon icon={icon} className="h-5 w-5 text-white" />
    </button>
  );
}
