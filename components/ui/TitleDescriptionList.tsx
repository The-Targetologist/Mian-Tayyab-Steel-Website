interface TitleDescriptionItem {
  id: string;
  title: string;
  description: string | null;
}

// Shared by product applications and service requirements — same
// title/optional-description card shape, structurally compatible via TS
// structural typing (docs/08-component-system.md's ApplicationList and
// ProjectRequirementBlock).
export function TitleDescriptionList({ items }: { items: TitleDescriptionItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-md border border-neutral-100 p-4 text-body-sm">
          <p className="font-medium text-neutral-950">{item.title}</p>
          {item.description && <p className="mt-1 text-neutral-600">{item.description}</p>}
        </li>
      ))}
    </ul>
  );
}
