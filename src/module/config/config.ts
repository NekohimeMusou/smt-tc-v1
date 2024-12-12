declare global {
  type CharacterClass = keyof typeof charClasses;
  type CharacterStat = keyof typeof stats;
  type SuccessRollCategory = (typeof successRollCategories)[number];
  type AttackCategory = keyof typeof attackCategories;
  type Affinity = keyof typeof affinities;
  type Ailment = keyof typeof ailments;
  type InheritanceTrait = keyof typeof inheritanceTraits;
  type SkillType = keyof typeof skillTypes;
  type SkillCostType = keyof typeof skillCostTypes;
  type PowerStat = keyof typeof powerStats;
}

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

const attackCategories = {
  phys: "SMT.atkCategory.phys",
  mag: "SMT.atkCategory.mag",
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
  // For Base Magic Power rolls off sheets
  mag: "SMT.affinities.mag",
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
} as const;

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
  phys: "SMT.skillType.phys",
  mag: "SMT.skillType.mag",
  gun: "SMT.skillType.gun",
  spell: "SMT.skillType.spell",
} as const;

const skillCostTypes = {
  hp: "HP",
  mp: "MP",
} as const;

const powerStats = {
  phys: "SMT.powerStats.phys",
  mag: "SMT.powerStats.mag",
  gun: "SMT.powerStats.gun",
} as const;

const successRollCategories = ["tn", "specialTN"] as const;

export const SMT = {
  charClasses,
  stats,
  attackCategories,
  affinities,
  ailments,
  inheritanceTraits,
  skillTypes,
  skillCostTypes,
  powerStats,
  successRollCategories,
} as const;
