import { getProfiles } from "@/data/registry";

/** Profiles page loader — all architectural profiles as flat array. */
export function profilesLoader() {
  return { profiles: getProfiles() };
}
