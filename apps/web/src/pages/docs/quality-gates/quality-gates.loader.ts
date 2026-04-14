import { getProfiles } from "@/data/registry";

/** Quality gates loader — extracts unique gates + which profiles use them. */
export function qualityGatesLoader() {
  const profiles = getProfiles();
  const gateMap = new Map<string, string[]>();

  for (const profile of profiles) {
    for (const gate of profile.scriptGates) {
      const existing = gateMap.get(gate) ?? [];
      existing.push(profile.id);
      gateMap.set(gate, existing);
    }
  }

  const gates = Array.from(gateMap.entries()).map(([id, usedBy]) => ({
    id,
    usedBy,
  }));

  return { gates };
}
