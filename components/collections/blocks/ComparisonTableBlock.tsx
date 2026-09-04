import type { CollectionBlock } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type Props = { block: Extract<CollectionBlock, { type: "comparison_table" }> };

// Real technical comparison data uses semantic <table> markup with a
// horizontal-scroll wrapper on narrow screens, rather than a stacked
// key/value layout — docs/07-design-system.md §12.
export function ComparisonTableBlock({ block }: Props) {
  return (
    <div>
      {block.title && (
        <h2 className="text-h2 font-bold text-neutral-950 lg:text-h2-lg">{block.title}</h2>
      )}
      <div className={cn("overflow-x-auto", block.title && "mt-6")}>
        <table className="w-full min-w-[480px] border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-neutral-200">
              {block.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left font-semibold text-neutral-950"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-neutral-100">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-neutral-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
