import { Icon } from "@iconify/react";
import { AspectRatio } from "#/components/ui/aspect-ratio";

interface InnerCardComponentProps {
  title: string;
  description: string;
  count?: number;
  reference?: string;
  location?: string;
  price?: number | null;
  photo?: string | null;
}

export function InnerCard(props: InnerCardComponentProps) {
  const hasDetails = props.reference || props.location;

  return (
    <div className="text-xs md:text-base flex items-center justify-between gap-2  rounded-xl border-2 bg-white border-gray-200 overflow-hidden">
      {props.photo && (
        <div className="w-20 shrink-0 p-1">
          <AspectRatio ratio={1}>
            <img
              src={props.photo}
              alt={props.title}
              className="h-full w-full rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.removeAttribute("hidden");
              }}
            />
            <div
              hidden
              className="h-full w-full flex items-center justify-center bg-gray-100"
            >
              <Icon
                icon="mdi:image-off-outline"
                className="h-6 w-6 text-gray-300"
              />
            </div>
          </AspectRatio>
        </div>
      )}
      <div
        className={`flex items-center justify-between gap-4 flex-1 ${props.photo ? "py-4 pr-4" : "p-4"}`}
      >
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
    </div>
  );
}
