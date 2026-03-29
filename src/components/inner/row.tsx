import { Icon } from "@iconify/react";

interface InnerRowProps {
  icon: string;
  label: string;
  value: string;
}

export function InnerRow({ icon, label, value }: InnerRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 bg-white border-gray-200 p-4">
      <Icon icon={icon} className="h-5 w-5 text-sky-500 shrink-0" />
      <div>
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
