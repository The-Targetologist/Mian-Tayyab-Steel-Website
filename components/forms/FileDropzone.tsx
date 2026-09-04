"use client";

import { useId, useRef, useState } from "react";
import { UploadIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface FileDropzoneProps {
  id?: string;
  name: string;
  accept?: string;
  hint?: string;
  error?: string;
}

// Replaces a raw <input type="file"> (which renders as an unstyleable
// browser-default "Choose File" button) with a styled drop zone matching
// this project's form field conventions — the underlying input still
// submits natively as part of the surrounding <form>, this only changes
// what's visible. Accepts an explicit `id` so a wrapping FormField's
// <label htmlFor> correctly targets the real (visually-hidden) input —
// clicking that label then opens the native file picker, same as any other
// labeled file input.
export function FileDropzone({ id, name, accept, hint, error }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  function handleFiles(files: FileList | null) {
    setFileName(files?.[0]?.name ?? null);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files?.length && inputRef.current) {
      inputRef.current.files = files;
      handleFiles(files);
    }
  }

  function handleRemove(event: React.MouseEvent) {
    event.stopPropagation();
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-labelledby={`${inputId}-label`}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors duration-fast",
          isDragOver ? "border-brand-600 bg-brand-50" : "border-neutral-200 hover:border-neutral-300",
        )}
      >
        <UploadIcon className={isDragOver ? "text-brand-600" : "text-neutral-400"} />
        {fileName ? (
          <div className="flex flex-wrap items-center justify-center gap-2 text-body-sm text-neutral-900">
            <span className="font-medium">{fileName}</span>
            <button type="button" onClick={handleRemove} className="text-caption font-medium text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ) : (
          <>
            <p id={`${inputId}-label`} className="text-body-sm text-neutral-700">
              <span className="font-medium text-brand-600">Click to upload</span> or drag and drop
            </p>
            {hint && <p className="text-caption text-neutral-500">{hint}</p>}
          </>
        )}
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={name}
        accept={accept}
        onChange={(event) => handleFiles(event.target.files)}
        className="sr-only"
      />
      {error && (
        <p role="alert" className="text-body-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
