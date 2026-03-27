interface InnerCardComponentProps {
  title: string;
  description: string;
  count: number;
}

export function InnerCard(props: InnerCardComponentProps) {
  return (
    <div className="text-xs md:text-base flex items-center justify-between gap-4 rounded-xl border-2 border-gray-200 p-4">
      <div>
        <p className="text-base font-semibold">{props.title}</p>
        <p className="text-neutral-500">{props.description}</p>
      </div>
      <p className="bg-sky-200 py-2 px-3 rounded-lg text-sky-800">
        {props.count}
      </p>
    </div>
  );
}
