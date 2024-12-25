import { SMT } from "../../config/config.js";
import { SmtActor } from "../../documents/actor/actor.js";
import { generateResourceSchema } from "./fields/resource-fields.js";
import { generateStatSchema } from "./fields/stat-fields.js";

const fields = foundry.data.fields;

const tn = new fields.SchemaField({
  save: new fields.NumberField({ integer: true }),
  dodge: new fields.NumberField({ integer: true }),
  negotiation: new fields.NumberField({ integer: true }),
});

const power = new fields.SchemaField({
  phys: new fields.NumberField({ integer: true }),
  mag: new fields.NumberField({ integer: true }),
  gun: new fields.NumberField({ integer: true }),
});

const resist = new fields.SchemaField({
  phys: new fields.NumberField({ integer: true }),
  mag: new fields.NumberField({ integer: true }),
});

const stats = new fields.SchemaField({
  st: new fields.SchemaField(generateStatSchema()),
  ma: new fields.SchemaField(generateStatSchema()),
  vi: new fields.SchemaField(generateStatSchema()),
  ag: new fields.SchemaField(generateStatSchema()),
  lu: new fields.SchemaField(generateStatSchema()),
});

const resources = {
  hp: new fields.SchemaField(generateResourceSchema()),
  mp: new fields.SchemaField(generateResourceSchema()),
  fp: new fields.SchemaField(generateResourceSchema()),
};

const modifiers = new fields.SchemaField({
  dodgeBonus: new fields.NumberField({ integer: true, initial: 0 }),
  gun: new fields.NumberField({ integer: true, initial: 0 }),
  elementMultipliers: new fields.SchemaField({
    fire: new fields.NumberField({ positive: true, initial: 1 }),
    cold: new fields.NumberField({ positive: true, initial: 1 }),
    elec: new fields.NumberField({ positive: true, initial: 1 }),
    force: new fields.NumberField({ positive: true, initial: 1 }),
  }),
  powerfulStrikes: new fields.BooleanField({ initial: false }),
  powerfulSpells: new fields.BooleanField({ initial: false }),
  itemPro: new fields.BooleanField({ initial: false }),
  focused: new fields.BooleanField({ initial: false }),
  // Counterattack skills: Counter, Retaliate, Avenge
  // Might, Drain Attack, Attack All
});

const affinities = new fields.SchemaField({
  phys: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  fire: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  cold: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  elec: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  force: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  light: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  dark: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  mind: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  nerve: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  ruin: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  ailment: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  almighty: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  healing: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  support: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
  unique: new fields.StringField({
    choices: SMT.affinityLevels,
    initial: "none",
  }),
});

export class SmtCharacterDataModel extends foundry.abstract.TypeDataModel {
  get type() {
    return "character" as const;
  }
  static override defineSchema() {
    return {
      charClass: new fields.StringField({
        choices: SMT.charClasses,
        blank: false,
        initial: "human",
      }),
      xp: new fields.NumberField({ integer: true, initial: 0 }),
      level: new fields.NumberField({ integer: true, initial: 1 }),
      notes: new fields.HTMLField(),
      hpMultiplier: new fields.NumberField({ integer: true }),
      mpMultiplier: new fields.NumberField({ integer: true }),
      autoFailThreshold: new fields.NumberField({ integer: true, initial: 96 }),
      affinities,
      stats,
      tn,
      power,
      resist,
      modifiers,
      ...resources,
    } as const;
  }

  override prepareBaseData() {
    const data = this.#systemData;

    const stats = data.stats;

    // Calculate stat totals and TNs
    for (const [key, stat] of Object.entries(stats)) {
      const magatamaBonus = data.charClass === "fiend" ? stat.magatama : 0;
      stat.value = stat.base + stat.lv + magatamaBonus;
      stat.tn = stat.value * 5 + data.level;
      // Calculate the "special" TN associated with each stat
      switch (key) {
        case "st": // Phys attack TN
        case "ma": // Mag attack TN
        case "vi": // Save TN
          stat.specialTN = stat.tn;
          data.tn.save = stat.tn;
          break;
        case "ag": // Dodge TN
          stat.specialTN = stat.value + 10;
          data.tn.dodge = stat.specialTN + data.modifiers.dodgeBonus;
          break;
        case "lu": // Negotiation TN
          stat.specialTN = stat.value * 2 + 20;
          data.tn.negotiation = stat.specialTN;
          break;
      }
    }

    // Get HP and MP multipliers
    const isHuman = data.charClass === "human";
    // @ts-expect-error This field isn't readonly
    data.hpMultiplier = isHuman ? 4 : 6;
    // @ts-expect-error This field isn't readonly
    data.mpMultiplier = isHuman ? 2 : 3;

    // Calculate HP/MP/FP max
    data.hp.max = (stats.vi.value + data.level) * data.hpMultiplier;
    data.mp.max = (stats.ma.value + data.level) * data.mpMultiplier;
    data.fp.max = Math.floor(stats.lu.value / 5 + 5);

    // Calculate power and resistance
    data.power.phys = stats.st.value + data.level;
    data.power.mag = stats.ma.value + data.level;
    data.power.gun = stats.ag.value;

    data.resist.phys = Math.floor((stats.vi.value + data.level) / 2);
    data.resist.mag = Math.floor((stats.ma.value + data.level) / 2);
  }

  get #systemData() {
    return this as this & SmtActor["system"];
  }
}

export const ACTORMODELS = {
  character: SmtCharacterDataModel,
} as const;
