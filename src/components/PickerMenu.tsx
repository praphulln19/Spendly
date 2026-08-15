'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react';

/*
 * The app's one dropdown.
 *
 * Native <select> menus paint OS chrome -- square corners, system blue
 * highlight, system font -- which reads as a hole punched in the interface. This
 * renders the menu itself, and portals it to <body> because its usual home
 * inside `.apple-card` cannot work: the card sets `overflow-hidden`, and its
 * `backdrop-filter` makes it a containing block, so even `position: fixed` stays
 * clipped by it.
 */

export interface PickerOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  /** Span both columns — for a leading "All" style option */
  wide?: boolean;
}

interface PickerMenuProps<T extends string> {
  value: T;
  options: PickerOption<T>[];
  onChange: (value: T) => void;
  /** Accessible name for the control */
  label: string;
  triggerLabel: string;
  triggerIcon?: LucideIcon;
  /** Draw the trigger as the solid/primary state */
  active?: boolean;
  columns?: 1 | 2;
  menuWidth?: number;
  className?: string;
}

const ROW_H = 40;
const GAP = 6;
const PAD = 6;

export function PickerMenu<T extends string>({
  value,
  options,
  onChange,
  label,
  triggerLabel,
  triggerIcon: TriggerIcon,
  active = false,
  columns = 1,
  menuWidth = 200,
  className = '',
}: PickerMenuProps<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const close = useCallback(() => setPos(null), []);

  const estimatedHeight = (() => {
    const wide = options.filter((o) => o.wide).length;
    const rest = options.length - wide;
    const rows = wide + Math.ceil(rest / columns);
    return PAD * 2 + rows * ROW_H + Math.max(0, rows - 1) * GAP;
  })();

  const toggle = () => {
    if (pos) return close();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - menuWidth - 8);
    const fitsBelow = rect.bottom + 8 + estimatedHeight < window.innerHeight;
    setPos({
      top: fitsBelow ? rect.bottom + 8 : Math.max(8, rect.top - estimatedHeight - 8),
      left,
    });
  };

  useEffect(() => {
    if (!pos) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    // The panel is anchored to a rect measured once, so movement invalidates it.
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [pos, close]);

  const menu =
    pos && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div className="fixed inset-0 z-[60]" onClick={close} aria-hidden="true" />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              role="listbox"
              aria-label={label}
              style={{ top: pos.top, left: pos.left, width: menuWidth }}
              className={`fixed z-[61] p-1.5 rounded-2xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 shadow-2xl grid gap-1.5 ${
                columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {options.map((option) => {
                const selected = option.value === value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(option.value);
                      close();
                    }}
                    className={`h-10 px-3 rounded-2xl flex items-center gap-2 text-xs font-semibold transition-all active:scale-95 ${
                      option.wide && columns === 2 ? 'col-span-2' : ''
                    } ${
                      selected
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-black/[0.04] dark:bg-white/[0.07] text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 shrink-0 opacity-70" />}
                    <span className="flex-1 text-left truncate">{option.label}</span>
                    {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </motion.div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggle}
        aria-expanded={pos !== null}
        aria-label={label}
        className={`h-10 px-3 rounded-2xl inline-flex items-center gap-2 text-xs font-bold transition-all active:scale-[0.98] ${
          active || pos
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'bg-black/[0.05] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-300'
        } ${className}`}
      >
        {TriggerIcon && <TriggerIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />}
        <span className="flex-1 text-left truncate">{triggerLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 opacity-50 transition-transform duration-200 ${
            pos ? 'rotate-180' : ''
          }`}
        />
      </button>
      {menu}
    </>
  );
}
