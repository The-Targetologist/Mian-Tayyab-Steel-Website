import type { SVGProps } from "react";

// Small hand-authored icon set — avoids pulling in a full icon library for
// the handful of glyphs the global shell needs (menu, close, search).
type IconProps = SVGProps<SVGSVGElement>;

function baseProps(props: IconProps): IconProps {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="8.75" cy="8.75" r="5.75" />
      <path d="M17 17l-3.8-3.8" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M10 13V3M10 3l-4 4M10 3l4 4" />
      <path d="M3.5 13v2.5A1.5 1.5 0 0 0 5 17h10a1.5 1.5 0 0 0 1.5-1.5V13" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5.3 3.5h2l1 3.5-1.7 1.3a9 9 0 0 0 4.1 4.1l1.3-1.7 3.5 1v2c0 .8-.7 1.4-1.5 1.3A12.5 12.5 0 0 1 4 4.9c-.1-.8.5-1.4 1.3-1.4Z" />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M10 15.5V4.5M4.5 9.5 10 4l5.5 5.5" />
    </svg>
  );
}

// Filled brand mark, not the stroke style above — a WhatsApp button needs to
// be instantly recognizable as WhatsApp (same reasoning as using a real
// envelope glyph for email), so this is the one deliberate exception to the
// hand-drawn line-icon set.
export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" aria-hidden {...props}>
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.66 4.523 1.804 6.383L4 29l7.815-1.767A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.75a9.7 9.7 0 0 1-4.947-1.354l-.355-.21-4.64 1.05 1.02-4.53-.232-.372A9.69 9.69 0 0 1 5.25 15c0-5.93 4.824-10.75 10.754-10.75 5.93 0 10.746 4.82 10.746 10.75s-4.816 10.75-10.746 10.75Zm5.89-8.05c-.322-.161-1.906-.94-2.202-1.048-.295-.108-.51-.161-.725.161-.214.322-.83 1.048-1.018 1.263-.187.215-.375.242-.697.08-.322-.161-1.36-.501-2.59-1.598-.957-.853-1.603-1.907-1.791-2.229-.187-.322-.02-.496.141-.656.145-.145.322-.376.483-.564.161-.188.214-.322.322-.537.107-.215.054-.403-.027-.564-.08-.161-.725-1.749-.994-2.397-.262-.63-.528-.545-.725-.555l-.617-.01c-.214 0-.564.08-.859.403-.295.322-1.126 1.1-1.126 2.68 0 1.58 1.153 3.108 1.314 3.323.161.215 2.269 3.466 5.499 4.86.769.332 1.369.53 1.837.678.772.245 1.474.21 2.03.128.619-.092 1.906-.78 2.174-1.533.268-.752.268-1.397.187-1.533-.08-.135-.295-.215-.617-.376Z" />
    </svg>
  );
}
