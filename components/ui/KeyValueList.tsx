interface KeyValueItem {
  id: string;
  label: string;
  value: string;
  unit: string | null;
}

// Simple label/value pairs use a definition list rather than a <table> —
// docs/07-design-system.md §12 "Mobile options: stacked key/value layout."
// A true tabular comparison uses ComparisonTableBlock instead. Shared by
// product specifications and service capabilities (docs/08-component-system.md
// lists SpecificationList/CapabilityList separately, but both are the same
// label/value/unit shape — structurally compatible via TS structural typing,
// no need to duplicate the component).
export function KeyValueList({ items }: { items: KeyValueItem[] }) {
  if (items.length === 0) return null;

  return (
    <dl className="divide-y divide-neutral-100 border-y border-neutral-100">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <dt className="text-body-sm font-medium text-neutral-600">{item.label}</dt>
          <dd className="text-body-sm font-semibold text-neutral-950 sm:text-right">
            {item.value}
            {item.unit ? ` ${item.unit}` : ""}
          </dd>
        </div>
      ))}
    </dl>
  );
}
