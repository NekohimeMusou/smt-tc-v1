declare global {
  type CharClass = (typeof SMT.charClasses)[number];
  type SmtCharacterStat = (typeof SMT.stats)[number];
  type SuccessRollType = (typeof SMT.successRollTypes)[number];
  type AttackCategory = (typeof SMT.attackCategories)[number];
  type Affinity = (typeof SMT.affinities)[number];
  type StatusAilment = (typeof SMT.ailments)[number];
}

export const SMT = {
  charClasses: ["human", "demon", "fiend"],
  stats: ["st", "ma", "vi", "ag", "lu"],
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
