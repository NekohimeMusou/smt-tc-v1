export const SMT = {
  charClasses: ["human", "demon", "fiend"],
  // Temporary until I fix the actor sheet
  charClassLocs: {
    human: "SMT.charClasses.human",
    demon: "SMT.charClasses.demon",
    fiend: "SMT.charClasses.fiend",
  },
  stats: ["st", "ma", "vi", "ag", "lu"],
  rollTypes: ["tn", "specialTN"],
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

declare global {
  type SmtStat = "st" | "ma" | "vi" | "ag" | "lu";
  type DefenseAffinity =
  | "phys"
  | "fire"
  | "ice"
  | "elec"
  | "force"
  | "light"
  | "dark"
  | "mind"
  | "nerve"
  | "ruin"
  | "almighty"
  | "ailment";

  type SkillAffinity =
  | DefenseAffinity
  | "healing"
  | "support"
  | "unique"
  // For raw Base Magic Power rolls off sheet
  | "mag";

  type AttackType = "phys" | "mag";

  type CharClasses = "human" | "demon" | "fiend";
}
