import { Icon } from "@iconify/react";

interface InnerTagsProps {
  icon: string;
  label: string;
  tags: string[];
}

export function InnerTags({ icon, label, tags }: InnerTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border-2 bg-white border-gray-200 p-4">
      <Icon icon={icon} className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-neutral-400 mb-1">{label}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
