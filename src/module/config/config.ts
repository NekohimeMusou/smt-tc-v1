declare global {
  type CharClass = keyof typeof SMT.charClasses;
  type SmtCharacterStat = keyof typeof SMT.stats;
  type SuccessRollType = (typeof SMT.successRollTypes)[number];
  type AttackCategory = (typeof SMT.attackCategories)[number];
  type Affinity = (typeof SMT.affinities)[number];
  type StatusAilment = (typeof SMT.ailments)[number];
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
  successRollTypes: ["tn", "specialTN"],
  attackCategories: ["phys", "mag"],
  affinities: [
    "phys",
    "fire",
    "ice",
    "elec",
    "force",
    "light",
    "dark",
    "mind",
    "nerve",
    "ruin",
    "almighty",
    "ailment",
    "healing",
    "support",
    "unique",
    // For Base Magic Power rolls off sheets
    "mag",
  ],
  ailments: [
    "stone",
    "flied",
    "stun",
    "charm",
    "poison",
    "mute",
    "restrain",
    "freeze",
    "sleep",
    "panic",
    "shock",
    "curse",
  ],
} as const;
