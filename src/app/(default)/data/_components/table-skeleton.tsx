export default function TableSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-4">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-30 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <div className="h-4 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        <div className="h-10 w-20 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-20 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}