/**
 * The "Set your budget" action icon: a budget card with a plus notched into
 * its bottom-right corner.
 *
 * Built from solid shapes rather than strokes, the same way public/icon.svg is,
 * so nothing thins out when the icon is rendered small. The card is one path
 * with fill-rule="evenodd": the slot is a hole punched through it, and the
 * corner the plus sits in is a concave arc cut into the outline itself. That
 * keeps the whole mark a single colour on a transparent ground -- no mask, no
 * element ids to collide when the icon renders more than once on a page, and
 * the dark gap around the plus is whatever the surface behind it happens to be.
 */

const CARD_AND_SLOT =
  // Card outline, clockwise from the top-left corner, with the bottom-right
  // corner replaced by a 62r concave bite that clears the plus.
  'M132 140H332A48 48 0 0 1 380 188V274A62 62 0 0 0 318 336H132A48 48 0 0 1 84 288V188A48 48 0 0 1 132 140Z' +
  // The slot, as a hole.
  'M142 204H322A18 18 0 0 1 322 240H142A18 18 0 0 1 142 204Z';

/**
 * The mark alone, in currentColor, for use where a surrounding tile already
 * supplies the ground.
 */
export function SetBudgetMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={CARD_AND_SLOT} fillRule="evenodd" />
      <rect x="340" y="324" width="80" height="24" rx="12" />
      <rect x="368" y="296" width="24" height="80" rx="12" />
    </svg>
  );
}

/**
 * The mark on its own dark-charcoal squircle, for use where the icon has to
 * stand alone. The 120/512 corner radius is the 23.4% iOS squircle, matching
 * SpendlyAppIcon so the two sit together.
 */
export function SetBudgetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true" focusable="false">
      <rect width="512" height="512" rx="120" fill="#121214" />
      <g fill="#FFFFFF">
        <path d={CARD_AND_SLOT} fillRule="evenodd" />
        <rect x="340" y="324" width="80" height="24" rx="12" />
        <rect x="368" y="296" width="24" height="80" rx="12" />
      </g>
    </svg>
  );
}
