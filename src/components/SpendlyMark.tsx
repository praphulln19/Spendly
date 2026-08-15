/**
 * The Spendly mark, matching public/icon.svg.
 *
 * Draws only the bars, in currentColor, so the surrounding tile supplies the
 * ground the same way the app icon's rounded square does.
 */
export function SpendlyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <rect x="112" y="160" width="76" height="224" rx="38" />
      <rect x="218" y="216" width="76" height="168" rx="38" />
      <rect x="324" y="272" width="76" height="112" rx="38" />
    </svg>
  );
}
