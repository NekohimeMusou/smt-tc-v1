export default function affinitySchema() {
  const fields = foundry.data.fields;

  return {
    phys: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    fire: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    cold: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    elec: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    force: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    light: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    dark: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    mind: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    nerve: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    ruin: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    ailment: new fields.StringField({
      choices: CONFIG.SMT.affinityLevels,
      initial: "none",
    }),
    almighty: new fields.StringField({
      choices: { none: "SMT.affinities.none" },
      initial: "none",
    }),
    healing: new fields.StringField({
      choices: { none: "SMT.affinities.none" },
      initial: "none",
    }),
    support: new fields.StringField({
      choices: { none: "SMT.affinities.none" },
      initial: "none",
    }),
    unique: new fields.StringField({
      choices: { none: "SMT.affinities.none" },
      initial: "none",
    }),
    talk: new fields.StringField({
      choices: { none: "SMT.affinities.none" },
      initial: "none",
    }),
    none: new fields.StringField({
      choices: { none: "SMT.affinities.none" },
      initial: "none",
    }),
  } as const;
}
