export function AssociadoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-brand-border bg-brand-surface">
      <h2 className="border-b border-brand-border px-4 py-[13px] text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </div>
  );
}
