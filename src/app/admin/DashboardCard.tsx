export function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line-subtle bg-surface p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-medium text-ink-muted">{title}</h2>
      {children}
    </div>
  );
}
