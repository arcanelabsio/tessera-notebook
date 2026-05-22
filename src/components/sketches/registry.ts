import { lazy, type LazyExoticComponent, type ComponentType } from "react";

// Slug-keyed registry of concept widgets. Add an entry here when you
// author a sketch under ./concepts/<slug>.tsx — the episode picks it
// up automatically. Episodes without an entry render the ambient
// sketch only.
//
// All entries are lazy() so they live in their own JS chunk, fetched
// only when the matching episode is opened. The vendor-sketches chunk
// (see vite.config.ts) still hosts p5 once for all widgets.
export const CONCEPT_SKETCHES: Record<
  string,
  LazyExoticComponent<ComponentType>
> = {
  "two-regions-by-friday": lazy(
    () => import("./concepts/two-regions-by-friday"),
  ),
  "two-failures-one-shape": lazy(
    () => import("./concepts/two-failures-one-shape"),
  ),
  "where-the-data-lives": lazy(
    () => import("./concepts/where-the-data-lives"),
  ),
};

export function hasConceptSketch(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(CONCEPT_SKETCHES, slug);
}
