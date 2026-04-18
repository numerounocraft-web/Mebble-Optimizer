/**
 * Feature flags — controlled by NEXT_PUBLIC_APP_VERSION at build time.
 *
 * V1  Starter   — Resume builder, templates, PDF export, PDF/LinkedIn import.
 * V2  Optimizer — Everything in V1 + job description analysis, ATS scoring,
 *                 keyword detection, and one-click keyword injection.
 * V3  AI Pro    — Everything in V2 + AI-powered rewriting and coaching.
 *                 (Not yet implemented — reserved for a future release.)
 *
 * To build a specific version set the env var before running `next build`:
 *
 *   NEXT_PUBLIC_APP_VERSION=v1 npm run build   →  Starter build
 *   NEXT_PUBLIC_APP_VERSION=v2 npm run build   →  Optimizer build
 *
 * In development the default is "v2" so all features are visible.
 */

const VERSION = (process.env.NEXT_PUBLIC_APP_VERSION ?? "v2").toLowerCase();

export const APP_VERSION = VERSION;

export const features = {
  /** Job-description paste, ATS scoring, keyword pills, keyword injection. */
  jdOptimization: VERSION === "v2" || VERSION === "v3",

  /** AI-powered rewriting, coaching, cover-letter generation. */
  aiOptimization: VERSION === "v3",
} as const;
