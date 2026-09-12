export function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-medium text-zinc-500">{title}</h2>
      {children}
    </div>
  );
}
