import { SmtArmorDM } from "./typedata/armor-data.js";
import { SMTGunDM } from "./typedata/gun-data.js";
import { SMTItemDM } from "./typedata/item-data.js";
import { SMTSkillDM } from "./typedata/skill-data.js";
import { SMTWeaponDM } from "./typedata/weapon-data.js";
import { SMTMagatamaDM } from "./types/magatama.js";

export const ITEMMODELS = {
  armor: SmtArmorDM,
  gun: SMTGunDM,
  item: SMTItemDM,
  skill: SMTSkillDM,
  weapon: SMTWeaponDM,
  magatama: SMTMagatamaDM,
} as const;
