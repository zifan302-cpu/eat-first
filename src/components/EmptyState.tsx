interface EmptyStateProps {
  title: string;
  action?: JSX.Element;
}

export function EmptyState({ title, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-dashed border-stone-300 bg-white px-5 py-8 text-center">
      <p className="text-sm font-semibold text-stone-600">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
