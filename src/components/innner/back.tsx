import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";

interface InnerBackProps {
  to: string;
  params?: Record<string, string | number>;
  actionIcon?: string;
  onAction?: () => void;
  secondaryActionIcon?: string;
  onSecondaryAction?: () => void;
}

export function InnerBack({
  to,
  params,
  actionIcon,
  onAction,
  secondaryActionIcon,
  onSecondaryAction,
}: InnerBackProps) {
  return (
    <div className="flex items-center justify-between">
      <Link to={to} params={params}>
        <div className="rounded-full shadow-sky-200 bg-sky-500 shadow-lg border w-fit">
          <Icon icon="mdi:arrow-left" className="h-5 w-5 text-white m-4" />
        </div>
      </Link>
      {(actionIcon || secondaryActionIcon) && (
        <div className="flex items-center gap-2">
          {secondaryActionIcon && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="flex items-center justify-center rounded-full bg-white shadow-lg shadow-gray-100 border w-[52px] h-[52px]"
            >
              <Icon icon={secondaryActionIcon} className="h-5 w-5 text-sky-500" />
            </button>
          )}
          {actionIcon && (
            <button
              type="button"
              onClick={onAction}
              className="flex items-center justify-center rounded-full bg-sky-500 shadow-lg shadow-sky-200 border w-[52px] h-[52px]"
            >
              <Icon icon={actionIcon} className="h-5 w-5 text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
