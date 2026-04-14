import { getSkills, getSkillsByCategory } from "@/data/registry";

/** Skills page loader — groups all skills by category. */
export function skillsLoader() {
  return {
    skills: getSkills(),
    byCategory: Object.fromEntries(getSkillsByCategory()),
  };
}
