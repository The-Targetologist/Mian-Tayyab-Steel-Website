interface RelationOption {
  id: string;
  name: string;
}

interface RelationCheckboxListProps {
  label: string;
  name: string;
  options: RelationOption[];
  selectedIds: string[];
  emptyMessage?: string;
}

// Plain checkboxes sharing one `name` — FormData.getAll() reads them
// natively server-side, no client JS/state needed.
export function RelationCheckboxList({
  label,
  name,
  options,
  selectedIds,
  emptyMessage = "None available yet.",
}: RelationCheckboxListProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-sm font-medium text-neutral-900">{label}</p>
      {options.length === 0 ? (
        <p className="text-body-sm text-neutral-500">{emptyMessage}</p>
      ) : (
        <div className="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto rounded-md border border-neutral-100 p-3 sm:grid-cols-2">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-body-sm text-neutral-700">
              <input
                type="checkbox"
                name={name}
                value={option.id}
                defaultChecked={selectedIds.includes(option.id)}
                className="rounded-sm border-neutral-300 text-brand-600 focus:ring-brand-600"
              />
              {option.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
