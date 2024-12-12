declare global {
  type CharClass = keyof typeof SMT.charClasses;
  type SmtCharacterStat = keyof typeof SMT.stats;
  type SuccessRollCategory = (typeof SMT.successRollCategories)[number];
  type AttackCategory = keyof typeof SMT.attackCategories;
  type Affinity = keyof typeof SMT.affinities;
  type Ailment = keyof typeof SMT.ailments;
}

export const SMT = {
  charClasses: {
    human: "SMT.charClasses.human",
    fiend: "SMT.charClasses.fiend",
    demon: "SMT.charClasses.demon",
  },
  stats: {
    st: "SMT.stats.st",
    ma: "SMT.stats.ma",
    vi: "SMT.stats.vi",
    ag: "SMT.stats.ag",
    lu: "SMT.stats.lu",
  },
  successRollCategories: ["tn", "specialTN"],
  attackCategories: {
    phys: "SMT.atkCategory.phys",
    mag: "SMT.atkCategory.mag",
  },
  affinities: {
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
  },
  ailments: {
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
  },
} as const;
