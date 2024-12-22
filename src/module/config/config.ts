declare global {
  type CharacterClass = keyof typeof charClasses;
  type CharacterStat = keyof typeof stats;
  type SuccessRollCategory = (typeof successRollCategories)[number];
  type PowerType = keyof typeof powerTypes;
  type Affinity = keyof typeof affinities;
  type Ailment = keyof typeof ailments;
  type InheritanceTrait = keyof typeof inheritanceTraits;
  type SkillType = keyof typeof skillTypes;
  type SkillCostType = keyof typeof costTypes;
  type Target = keyof typeof targets;
  type AccuracyStat = keyof typeof accuracyStats;
  type StatRollTNType = (typeof sheetRollTNTypes)[number];
  type DiceRollResult = keyof typeof diceRollResults;
  type RollEffectType = (typeof rollEffectTypes)[number];
  type AffinityLevel = keyof typeof affinityLevels;
  type DamageType = keyof typeof damageTypes;
}

const sheetRollTNTypes = ["tn", "specialTN"] as const;

const templatePaths = [
  "systems/smt-tc/templates/parts/actor/header.hbs",
  "systems/smt-tc/templates/parts/actor/tab-main.hbs",
  "systems/smt-tc/templates/parts/actor/resources.hbs",
  "systems/smt-tc/templates/parts/actor/stats.hbs",
  "systems/smt-tc/templates/parts/actor/derived-stats.hbs",
  "systems/smt-tc/templates/parts/actor/weapons.hbs",
  "systems/smt-tc/templates/parts/actor/skills.hbs",
  "systems/smt-tc/templates/parts/item/header.hbs",
  "systems/smt-tc/templates/parts/item/skill/tab-main.hbs",
] as const;

const rollEffectTypes = [
  "hit",
  "dodge",
  "negotiation",
  "save",
  "other",
] as const;

const itemTypes = {
  skill: "SMT.itemTypes.skill",
  weapon: "SMT.itemTypes.weapon",
} as const;

const charClasses = {
  human: "SMT.charClasses.human",
  fiend: "SMT.charClasses.fiend",
  demon: "SMT.charClasses.demon",
} as const;

const stats = {
  st: "SMT.stats.st",
  ma: "SMT.stats.ma",
  vi: "SMT.stats.vi",
  ag: "SMT.stats.ag",
  lu: "SMT.stats.lu",
} as const;

const accuracyStats = {
  st: "SMT.stats.st",
  ma: "SMT.stats.ma",
  vi: "SMT.stats.vi",
  ag: "SMT.stats.ag",
  lu: "SMT.stats.lu",
  auto: "SMT.stats.auto",
} as const;

const powerTypes = {
  phys: "SMT.powerTypes.phys",
  mag: "SMT.powerTypes.mag",
  gun: "SMT.powerTypes.gun",
} as const;

const damageTypes = {
  phys: "SMT.powerTypes.phys",
  mag: "SMT.powerTypes.mag",
};
const costTypes = {
  hp: "HP",
  mp: "MP",
} as const;

const affinities = {
  phys: "SMT.affinities.phys",
  fire: "SMT.affinities.fire",
  ice: "SMT.affinities.ice",
  elec: "SMT.affinities.elec",
  force: "SMT.affinities.force",
  light: "SMT.affinities.light",
  dark: "SMT.affinities.dark",
  mind: "SMT.affinities.mind",
  nerve: "SMT.affinities.nerve",
  ruin: "SMT.affinities.ruin",
  almighty: "SMT.affinities.almighty",
  ailment: "SMT.affinities.ailment",
  healing: "SMT.affinities.healing",
  support: "SMT.affinities.support",
  unique: "SMT.affinities.unique",
} as const;

const affinityLevels = {
  reflect: "SMT.affinityLevels.reflect",
  drain: "SMT.affinityLevels.drain",
  null: "SMT.affinityLevels.null",
  resist: "SMT.affinityLevels.resist",
  weak: "SMT.affinityLevels.weak",
  none: "SMT.affinityLevels.none",
} as const;

const ailments = {
  stone: "SMT.ailments.stone",
  flied: "SMT.ailments.flied",
  stun: "SMT.ailments.stun",
  charm: "SMT.ailments.charm",
  poison: "SMT.ailments.poison",
  mute: "SMT.ailments.mute",
  restrain: "SMT.ailments.restrain",
  freeze: "SMT.ailments.freeze",
  sleep: "SMT.ailments.sleep",
  panic: "SMT.ailments.panic",
  shock: "SMT.ailments.shock",
  curse: "SMT.ailments.curse",
  none: "SMT.ailments.none",
} as const;

// TODO: Use these instead of a string field
const inheritanceTraits = {
  mouth: "SMT.inheritanceTraits.mouth",
  eye: "SMT.inheritanceTraits.eye",
  lunge: "SMT.inheritanceTraits.lunge",
  weapon: "SMT.inheritanceTraits.weapon",
  claw: "SMT.inheritanceTraits.claw",
  teeth: "SMT.inheritanceTraits.teeth",
  none: "SMT.inheritanceTraits.none",
} as const;

const skillTypes = {
  phys: "SMT.skillTypes.phys",
  mag: "SMT.skillTypes.mag",
  gun: "SMT.skillTypes.gun",
  spell: "SMT.skillTypes.spell",
  passive: "SMT.skillTypes.passive",
  talk: "SMT.skillTypes.talk",
  // For "passive" skills with conditional rolls attached, like Lucky Find and Good Instincts
  other: "SMT.skillTypes.other",
} as const;

const successRollCategories = ["tn", "specialTN"] as const;

const targets = {
  one: "SMT.target.one",
  all: "SMT.target.all",
  allCombatants: "SMT.target.allCombatants",
};

const diceRollResults = {
  success: "SMT.diceResult.success",
  fail: "SMT.diceResult.fail",
  autofail: "SMT.diceResult.autofail",
  crit: "SMT.diceResult.crit",
  fumble: "SMT.diceResult.fumble",
};

export const SMT = {
  charClasses,
  stats,
  accuracyStats,
  powerTypes,
  damageTypes,
  affinities,
  affinityLevels,
  ailments,
  inheritanceTraits,
  skillTypes,
  costTypes,
  successRollCategories,
  targets,
  itemTypes,
  templatePaths,
  sheetRollTNTypes,
  diceRollResults,
  rollEffectTypes,
  defaultAutofailThreshold: 96,
} as const;
