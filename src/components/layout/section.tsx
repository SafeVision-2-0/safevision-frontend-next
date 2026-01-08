export default function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-572.5 flex-col items-center justify-between bg-white px-6 sm:px-16 py-8 sm:items-start dark:bg-black">
        { children }
      </main>
    </div>
  );
}
