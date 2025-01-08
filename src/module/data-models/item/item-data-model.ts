import { ActionData } from "./models/action.js";
import { SkillData } from "./models/skill.js";

export const ITEMMODELS = {
  skill: SkillData,
  action: ActionData,
} as const;
