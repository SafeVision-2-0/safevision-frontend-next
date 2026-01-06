interface CapturedPersonItemProps {
  name: string;
  time: string;
  date: string;
  imageUrl: string;
}

export function CapturedPersonItem({ name, time, date, imageUrl }: CapturedPersonItemProps) {
  return (
    <div className="relative grid cursor-pointer grid-cols-2 gap-3 border-l-2 border-gray-200 py-2 pl-4 dark:border-gray-700">
      <div className="absolute top-1/2 -left-1.25 h-2 w-2 -translate-y-1/2 rounded-full bg-gray-300 text-transparent dark:bg-gray-600">
        .
      </div>
      <img className="aspect-video w-full rounded-lg object-cover" src={imageUrl} alt={name} />
      <div className="flex flex-col justify-center">
        <h1 className="font-semibold">{name}</h1>
        <span className="text-sm text-gray-500">{time}</span>
        <span className="text-sm text-gray-500">{date}</span>
      </div>
    </div>
  );
}
