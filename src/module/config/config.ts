declare global {
  type CharacterClass = keyof typeof charClasses;
  type CharacterStat = keyof typeof stats;
  type SuccessRollCategory = (typeof successRollCategories)[number];
  type Affinity = keyof typeof affinities;
  type Ailment = keyof typeof ailments;
  type InheritanceTrait = keyof typeof inheritanceTraits;
  type SkillType = keyof typeof skillTypes;
  type PowerBoostType = keyof typeof powerBoostTypes;
  type SkillCostType = keyof typeof costTypes;
  type Target = keyof typeof targets;
  type AccuracyStat = keyof typeof accuracyStats;
  type DiceRollResult = keyof typeof diceRollResults;
  type AffinityLevel = keyof typeof affinityLevels;
  type DamageType = keyof typeof damageTypes;
  type DerivedTN = (typeof derivedTNs)[number];
}

const templatePaths = [
  "systems/smt-tc/templates/parts/actor/header.hbs",
  "systems/smt-tc/templates/parts/actor/tab-main.hbs",
  "systems/smt-tc/templates/parts/actor/tab-options.hbs",
  "systems/smt-tc/templates/parts/actor/resources.hbs",
  "systems/smt-tc/templates/parts/actor/stats.hbs",
  "systems/smt-tc/templates/parts/actor/derived-stats.hbs",
  "systems/smt-tc/templates/parts/actor/weapons.hbs",
  "systems/smt-tc/templates/parts/actor/skills.hbs",
  "systems/smt-tc/templates/parts/item/header.hbs",
  "systems/smt-tc/templates/parts/item/skill/tab-main.hbs",
  "systems/smt-tc/templates/parts/item/attack.hbs",
  "systems/smt-tc/templates/parts/item/options.hbs",
  "systems/smt-tc/templates/parts/item/skill/tab-options.hbs",
  "systems/smt-tc/templates/parts/actor/affinities.hbs",
  "systems/smt-tc/templates/parts/actor/dice-modifiers.hbs",
  "systems/smt-tc/templates/parts/actor/buffs.hbs",
  "systems/smt-tc/templates/parts/actor/modifiers.hbs",
  "systems/smt-tc/templates/parts/shared/tab-effects.hbs",
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

const damageTypes = {
  phys: "SMT.powerTypes.phys",
  mag: "SMT.powerTypes.mag",
} as const;

const powerBoostTypes = {
  phys: "SMT.powerTypes.phys",
  mag: "SMT.powerTypes.mag",
  item: "SMT.powerTypes.item",
} as const;

const costTypes = {
  hp: "HP",
  mp: "MP",
} as const;

const affinities = {
  phys: "SMT.affinities.phys",
  fire: "SMT.affinities.fire",
  cold: "SMT.affinities.cold",
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
  talk: "SMT.affinities.talk",
  none: "SMT.affinities.none",
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
  none: "SMT.ailments.none",
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
  instantKill: "SMT.ailments.instantKill",
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
  item: "SMT.skillTypes.item",
  // For "passive" skills with conditional rolls attached, like Lucky Find and Good Instincts
  other: "SMT.skillTypes.other",
} as const;

const successRollCategories = ["tn", "derivedTN"] as const;

const targets = {
  one: "SMT.target.one",
  all: "SMT.target.all",
  allCombatants: "SMT.target.allCombatants",
  self: "SMT.target.self",
} as const;

const diceRollResults = {
  success: "SMT.diceResult.success",
  fail: "SMT.diceResult.fail",
  autofail: "SMT.diceResult.autofail",
  crit: "SMT.diceResult.crit",
  fumble: "SMT.diceResult.fumble",
} as const;

const derivedTNs = [
  "physAtk",
  "magAtk",
  "save",
  "dodge",
  "negotiation",
] as const;

const derivedTNStats = {
  st: "physAtk",
  ma: "magAtk",
  vi: "save",
  ag: "dodge",
  lu: "negotiation",
} as const;

export const SMT = {
  charClasses,
  stats,
  accuracyStats,
  damageTypes,
  powerBoostTypes,
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
  diceRollResults,
  derivedTNs,
  derivedTNStats,
  defaultAutofailThreshold: 96,
} as const;
