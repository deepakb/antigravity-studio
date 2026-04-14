import { getRegistryStats } from "@/data/registry";

/**
 * Home page loader — provides registry stats for the hero section.
 * Resolved at build time via static JSON import.
 */
export function homeLoader() {
  return { stats: getRegistryStats() };
}
