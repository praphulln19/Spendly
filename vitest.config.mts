import { defineConfig } from 'vitest/config';

/*
 * The allowance engine is pure and dependency-free, so tests run in plain node
 * -- no jsdom, no setup file, nothing to keep in sync with the app shell.
 *
 * `include` is deliberately narrow rather than the default glob: it keeps the
 * runner from wandering into build output under .next/, which holds compiled
 * copies of everything here.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    /*
     * The engine reasons entirely in local time, and its trickiest rule -- that
     * a day is not always 86_400_000 ms -- only bites where the clocks change.
     * Run the suite somewhere west of UTC that observes DST, so the date
     * arithmetic is exercised against real 23- and 25-hour days rather than
     * passing vacuously in IST or on a UTC runner.
     */
    env: { TZ: 'America/New_York' },
  },
});
