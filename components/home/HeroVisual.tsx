// Geometric placeholder standing in for real product/facility photography
// (docs/PROJECT_STATE.md "Pending Brand Inputs" — original photography not
// yet supplied). Layered/crossing flat-bar forms reference structural steel
// profiles per docs/05-design-direction.md §10, rather than a generic
// abstract shape or fake stock photo. Swap for real photography once
// supplied.
export function HeroVisual() {
  return (
    <svg
      viewBox="0 0 480 480"
      className="h-full w-full"
      role="img"
      aria-label="Abstract illustration of layered steel profiles"
    >
      <rect width="480" height="480" className="fill-brand-50" />
      <g transform="rotate(-8 240 240)">
        <rect x="60" y="150" width="360" height="34" className="fill-brand-950" />
        <rect x="60" y="204" width="360" height="34" className="fill-brand-700" />
        <rect x="60" y="258" width="360" height="34" className="fill-brand-600" />
        <rect x="150" y="60" width="34" height="360" className="fill-brand-500" />
      </g>
    </svg>
  );
}
