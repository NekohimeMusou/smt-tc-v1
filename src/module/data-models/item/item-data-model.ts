import { SmtSkillDataModel } from "./types/skill.js";
import { SmtWeaponDataModel } from "./types/weapon.js";

export const ITEMMODELS = {
  skill: SmtSkillDataModel,
  weapon: SmtWeaponDataModel,
} as const;
