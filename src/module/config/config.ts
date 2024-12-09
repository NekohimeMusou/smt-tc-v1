const charClasses = {
  human: "SMT.charClasses.human",
  demon: "SMT.charClasses.demon",
  fiend: "SMT.charClasses.fiend",
};

const stats = ["st", "ma", "vi", "ag", "lu"];

const rollTypes = ["tn", "specialTN"];

export const SMT = {
  charClasses,
  stats,
  rollTypes,
} as const;

declare global {
  type SmtStat = "st" | "ma" | "vi" | "ag" | "lu";
}
