import { Icon } from "@iconify/react";

interface InnerCardComponentProps {
  title: string;
  description: string;
  count?: number;
  reference?: string;
  location?: string;
  price?: number | null;
}

export function InnerCard(props: InnerCardComponentProps) {
  const hasDetails = props.reference || props.location;

  return (
    <div className="text-xs md:text-base flex items-center justify-between gap-4 rounded-xl border-2 bg-white border-gray-200 p-4">
      <div className="min-w-0">
        <p className="text-base font-semibold truncate">{props.title}</p>
        <p className="text-neutral-500 truncate">{props.description}</p>
        {hasDetails && (
          <div className="flex items-center gap-3 mt-1">
            {props.reference && (
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Icon icon="mdi:barcode" className="h-3.5 w-3.5" />
                {props.reference}
              </span>
            )}
            {props.location && (
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <Icon icon="mdi:map-marker-outline" className="h-3.5 w-3.5" />
                {props.location}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {props.count !== undefined && (
          <p className="bg-sky-200 py-2 px-3 rounded-lg text-sky-800">
            {props.count}
          </p>
        )}
        {props.price != null && (
          <span className="bg-sky-100 text-sky-800 text-xs font-medium px-2 py-1 rounded-lg">
            {props.price} €
          </span>
        )}
      </div>
    </div>
  );
}
