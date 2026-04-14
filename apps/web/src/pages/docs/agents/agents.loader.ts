import { getAgents, getAgentsByCategory } from "@/data/registry";

/** Agents page loader — groups all agents by category for the catalogue view. */
export function agentsLoader() {
  return {
    agents: getAgents(),
    byCategory: Object.fromEntries(getAgentsByCategory()),
  };
}
