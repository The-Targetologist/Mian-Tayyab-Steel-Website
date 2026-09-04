"use client";

import { useId, useState } from "react";
import type { CollectionBlock } from "@/types/content";
import { formInputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ImageUploaderInline } from "./ImageUploaderInline";

interface ContentBlockEditorProps {
  hiddenInputName: string;
  initialBlocks?: CollectionBlock[];
}

const BLOCK_TYPE_LABELS: Record<CollectionBlock["type"], string> = {
  rich_text: "Rich text",
  image_text: "Image + text",
  feature_list: "Feature list",
  solution_cards: "Solution cards",
  application_grid: "Application grid",
  industry_list: "Industry list",
  comparison_table: "Comparison table",
  selection_guide: "Selection guide",
  cta: "Call to action",
};

function emptyBlockFor(type: CollectionBlock["type"]): CollectionBlock {
  switch (type) {
    case "rich_text":
      return { type, title: "", body: "" };
    case "image_text":
      return { type, title: "", body: "", image: null, imagePosition: "right" };
    case "feature_list":
    case "solution_cards":
    case "application_grid":
      return { type, title: "", items: [] };
    case "industry_list":
      return { type, title: "", items: [] };
    case "comparison_table":
      return { type, title: "", columns: [], rows: [] };
    case "selection_guide":
      return { type, title: "", steps: [] };
    case "cta":
      return { type, title: "", body: "", buttonLabel: "", buttonHref: "" };
  }
}

// The admin UI for docs/09's "structured JSON content blocks with a
// controlled block schema" — the hardest piece of the Collections editor.
// Manages the whole content_blocks array as local state (blocks have
// genuinely different shapes per type, unlike RepeaterField's uniform rows)
// and serializes to one hidden JSON input on every change.
export function ContentBlockEditor({ hiddenInputName, initialBlocks = [] }: ContentBlockEditorProps) {
  const [blocks, setBlocks] = useState<CollectionBlock[]>(initialBlocks);
  const [addingType, setAddingType] = useState<CollectionBlock["type"] | "">("");
  const baseId = useId();

  function updateBlock(index: number, next: CollectionBlock) {
    setBlocks((prev) => prev.map((block, i) => (i === index ? next : block)));
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addBlock() {
    if (!addingType) return;
    setBlocks((prev) => [...prev, emptyBlockFor(addingType)]);
    setAddingType("");
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name={hiddenInputName} value={JSON.stringify(blocks)} />

      {blocks.length === 0 && (
        <p className="text-body-sm text-neutral-500">No content blocks yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => (
          <div key={`${baseId}-${index}`} className="rounded-md border border-neutral-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-body-sm font-semibold text-neutral-950">
                {BLOCK_TYPE_LABELS[block.type]}
              </p>
              <div className="flex items-center gap-3 text-body-sm">
                <button type="button" onClick={() => moveBlock(index, -1)} className="text-neutral-500 hover:text-neutral-900">
                  ↑
                </button>
                <button type="button" onClick={() => moveBlock(index, 1)} className="text-neutral-500 hover:text-neutral-900">
                  ↓
                </button>
                <button type="button" onClick={() => removeBlock(index)} className="font-medium text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            </div>
            <BlockFields block={block} onChange={(next) => updateBlock(index, next)} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={addingType}
          onChange={(event) => setAddingType(event.target.value as CollectionBlock["type"])}
          className={formInputClasses}
        >
          <option value="">Choose block type...</option>
          {Object.entries(BLOCK_TYPE_LABELS).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" onClick={addBlock} disabled={!addingType}>
          Add block
        </Button>
      </div>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: CollectionBlock;
  onChange: (next: CollectionBlock) => void;
}) {
  switch (block.type) {
    case "rich_text":
      return (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Title (optional)"
            value={block.title ?? ""}
            onChange={(event) => onChange({ ...block, title: event.target.value })}
            className={formInputClasses}
          />
          <textarea
            placeholder="Body"
            rows={3}
            value={block.body}
            onChange={(event) => onChange({ ...block, body: event.target.value })}
            className={formInputClasses}
          />
        </div>
      );

    case "image_text":
      return (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Title"
            value={block.title}
            onChange={(event) => onChange({ ...block, title: event.target.value })}
            className={formInputClasses}
          />
          <textarea
            placeholder="Body"
            rows={3}
            value={block.body}
            onChange={(event) => onChange({ ...block, body: event.target.value })}
            className={formInputClasses}
          />
          <select
            value={block.imagePosition}
            onChange={(event) =>
              onChange({ ...block, imagePosition: event.target.value as "left" | "right" })
            }
            className={formInputClasses}
          >
            <option value="right">Image on right</option>
            <option value="left">Image on left</option>
          </select>
          <ImageUploaderInline
            label="Image"
            folder="collections"
            asset={block.image}
            onChange={(asset) => onChange({ ...block, image: asset })}
          />
        </div>
      );

    case "feature_list":
    case "solution_cards":
    case "application_grid":
      return (
        <ItemListEditor
          title={block.title}
          items={block.items}
          onTitleChange={(title) => onChange({ ...block, title })}
          onItemsChange={(items) => onChange({ ...block, items })}
        />
      );

    case "industry_list":
      return (
        <StringListEditor
          title={block.title}
          items={block.items}
          onTitleChange={(title) => onChange({ ...block, title })}
          onItemsChange={(items) => onChange({ ...block, items })}
        />
      );

    case "comparison_table":
      return <ComparisonTableEditor block={block} onChange={onChange} />;

    case "selection_guide":
      return (
        <ItemListEditor
          title={block.title}
          items={block.steps}
          itemLabel="step"
          onTitleChange={(title) => onChange({ ...block, title })}
          onItemsChange={(steps) => onChange({ ...block, steps })}
        />
      );

    case "cta":
      return (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Title"
            value={block.title}
            onChange={(event) => onChange({ ...block, title: event.target.value })}
            className={formInputClasses}
          />
          <textarea
            placeholder="Body (optional)"
            rows={2}
            value={block.body ?? ""}
            onChange={(event) => onChange({ ...block, body: event.target.value })}
            className={formInputClasses}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Button label"
              value={block.buttonLabel}
              onChange={(event) => onChange({ ...block, buttonLabel: event.target.value })}
              className={formInputClasses}
            />
            <input
              type="text"
              placeholder="Button link"
              value={block.buttonHref}
              onChange={(event) => onChange({ ...block, buttonHref: event.target.value })}
              className={formInputClasses}
            />
          </div>
        </div>
      );
  }
}

function ItemListEditor({
  title,
  items,
  itemLabel = "item",
  onTitleChange,
  onItemsChange,
}: {
  title?: string;
  items: { title: string; description?: string }[];
  itemLabel?: string;
  onTitleChange: (title: string) => void;
  onItemsChange: (items: { title: string; description?: string }[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Section title (optional)"
        value={title ?? ""}
        onChange={(event) => onTitleChange(event.target.value)}
        className={formInputClasses}
      />
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            placeholder={`${itemLabel} title`}
            value={item.title}
            onChange={(event) =>
              onItemsChange(items.map((it, i) => (i === index ? { ...it, title: event.target.value } : it)))
            }
            className={formInputClasses}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={item.description ?? ""}
            onChange={(event) =>
              onItemsChange(
                items.map((it, i) => (i === index ? { ...it, description: event.target.value } : it)),
              )
            }
            className={formInputClasses}
          />
          <button
            type="button"
            onClick={() => onItemsChange(items.filter((_, i) => i !== index))}
            className="shrink-0 text-body-sm font-medium text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="text"
        onClick={() => onItemsChange([...items, { title: "", description: "" }])}
        className="w-fit"
      >
        Add {itemLabel}
      </Button>
    </div>
  );
}

function StringListEditor({
  title,
  items,
  onTitleChange,
  onItemsChange,
}: {
  title?: string;
  items: string[];
  onTitleChange: (title: string) => void;
  onItemsChange: (items: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Section title (optional)"
        value={title ?? ""}
        onChange={(event) => onTitleChange(event.target.value)}
        className={formInputClasses}
      />
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(event) => onItemsChange(items.map((it, i) => (i === index ? event.target.value : it)))}
            className={formInputClasses}
          />
          <button
            type="button"
            onClick={() => onItemsChange(items.filter((_, i) => i !== index))}
            className="shrink-0 text-body-sm font-medium text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}
      <Button type="button" variant="text" onClick={() => onItemsChange([...items, ""])} className="w-fit">
        Add item
      </Button>
    </div>
  );
}

function ComparisonTableEditor({
  block,
  onChange,
}: {
  block: Extract<CollectionBlock, { type: "comparison_table" }>;
  onChange: (next: CollectionBlock) => void;
}) {
  function updateColumn(index: number, value: string) {
    onChange({ ...block, columns: block.columns.map((c, i) => (i === index ? value : c)) });
  }

  function addColumn() {
    onChange({
      ...block,
      columns: [...block.columns, ""],
      rows: block.rows.map((row) => [...row, ""]),
    });
  }

  function removeColumn(index: number) {
    onChange({
      ...block,
      columns: block.columns.filter((_, i) => i !== index),
      rows: block.rows.map((row) => row.filter((_, i) => i !== index)),
    });
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    onChange({
      ...block,
      rows: block.rows.map((row, r) =>
        r === rowIndex ? row.map((cell, c) => (c === colIndex ? value : cell)) : row,
      ),
    });
  }

  function addRow() {
    onChange({ ...block, rows: [...block.rows, block.columns.map(() => "")] });
  }

  function removeRow(index: number) {
    onChange({ ...block, rows: block.rows.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Section title (optional)"
        value={block.title ?? ""}
        onChange={(event) => onChange({ ...block, title: event.target.value })}
        className={formInputClasses}
      />

      <div className="flex flex-col gap-2">
        <p className="text-caption font-medium text-neutral-600 uppercase">Columns</p>
        <div className="flex flex-wrap gap-2">
          {block.columns.map((column, index) => (
            <div key={index} className="flex gap-1">
              <input
                type="text"
                value={column}
                onChange={(event) => updateColumn(index, event.target.value)}
                className={formInputClasses}
              />
              <button type="button" onClick={() => removeColumn(index)} className="text-body-sm text-red-600 hover:underline">
                ×
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="text" onClick={addColumn} className="w-fit">
          Add column
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-caption font-medium text-neutral-600 uppercase">Rows</p>
        {block.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => (
              <input
                key={colIndex}
                type="text"
                value={cell}
                onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)}
                className={formInputClasses}
              />
            ))}
            <button type="button" onClick={() => removeRow(rowIndex)} className="shrink-0 text-body-sm text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
        <Button type="button" variant="text" onClick={addRow} disabled={block.columns.length === 0} className="w-fit">
          Add row
        </Button>
      </div>
    </div>
  );
}
