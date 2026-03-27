interface InnerCardComponentProps {
  title: string;
  description: string;
  count: number;
}

export function InnerCardComponent(props: InnerCardComponentProps) {
  return (
    <div className="text-xs md:text-base flex items-center justify-between gap-4 rounded-xl border-2 border-gray-200 p-4">
      <div>
        <p className="text-base font-semibold">{props.title}</p>
        <p>{props.description}</p>
      </div>
      <p className="bg-blue-100 py-2 px-3 rounded-lg text-blue-700">
        {props.count}
      </p>
    </div>
  );
}
