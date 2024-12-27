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
});

const modifiers = {
  expertDodge: new fields.BooleanField(),
  sureShot: new fields.BooleanField(),
  powerBoost: new fields.SchemaField({
    phys: new fields.BooleanField(),
    mag: new fields.BooleanField(),
  }),
  might: new fields.BooleanField(),
  elementBoosts: new fields.SchemaField({
    fire: new fields.BooleanField(),
    cold: new fields.BooleanField(),
    elec: new fields.BooleanField(),
    force: new fields.BooleanField(),
  }),
  focused: new fields.BooleanField({ initial: false }),
  cursed: new fields.BooleanField(),
  // IMPLEMENT
  itemPro: new fields.BooleanField({ initial: false }),
  tnBonuses: new fields.NumberField({ integer: true, initial: 0 }), // +/- 20 TN bonuses from the sheet
  multi: new fields.NumberField({
    integer: true,
    initial: 1,
    positive: true,
    max: 3,
  }),
  resourceBoost: new fields.SchemaField({
    hp: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
    mp: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
  }),
} as const;

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
      // -kaja and -kunda spells
      buffs: new fields.SchemaField({
        physPower: new fields.NumberField({ integer: true }),
        magPower: new fields.NumberField({ integer: true }),
        accuracy: new fields.NumberField({ integer: true }),
        resist: new fields.NumberField({ integer: true }),
      }),
      affinities,
      stats,
      tn,
      power,
      resist,
      ...modifiers,
      ...resources,
    } as const;
  }

  override prepareBaseData() {
    const data = this.#systemData;

    const stats = data.stats;
    const tnMod = data.tnBonuses * 20;

    // Calculate stat totals and TNs
    for (const [key, stat] of Object.entries(stats)) {
      const magatamaBonus = data.charClass === "fiend" ? stat.magatama : 0;
      stat.value = stat.base + stat.lv + magatamaBonus;
      stat.tn = stat.value * 5 + data.level + tnMod;
      // Calculate the "special" TN associated with each stat
      switch (key) {
        case "st": // Phys attack TN
        case "ma": // Mag attack TN
          stat.specialTN = stat.tn;
          break;
        case "vi": // Save TN
          stat.specialTN = stat.tn - tnMod;
          data.tn.save = stat.specialTN;
          break;
        case "ag": // Dodge TN
          stat.specialTN =
            stat.value + 10 + (data.expertDodge ? 5 : 0) + data.buffs.accuracy;
          data.tn.dodge = stat.specialTN;
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
    data.hpMultiplier = (isHuman ? 4 : 6) + (data.resourceBoost.hp ?? 0);
    // @ts-expect-error This field isn't readonly
    data.mpMultiplier = (isHuman ? 2 : 3) + (data.resourceBoost.mp ?? 0);

    // Calculate HP/MP/FP max
    data.hp.max = (stats.vi.value + data.level) * data.hpMultiplier;
    data.mp.max = (stats.ma.value + data.level) * data.mpMultiplier;
    data.fp.max = Math.floor(stats.lu.value / 5 + 5);

    // Calculate power and resistance
    data.power.phys = stats.st.value + data.level + data.buffs.physPower;
    data.power.mag = stats.ma.value + data.level + data.buffs.magPower;
    data.power.gun = stats.ag.value + data.buffs.physPower;

    data.resist.phys =
      Math.floor((stats.vi.value + data.level) / 2) + data.buffs.resist;
    data.resist.mag =
      Math.floor((stats.ma.value + data.level) / 2) + data.buffs.resist;

    // @ts-expect-error This field isn't readonly
    data.autoFailThreshold = data.cursed ? 86 : 96;
  }

  get st(): number {
    return this.#systemData.stats.st.value;
  }

  get ma(): number {
    return this.#systemData.stats.ma.value;
  }

  get vi(): number {
    return this.#systemData.stats.vi.value;
  }

  get ag(): number {
    return this.#systemData.stats.ag.value;
  }

  get lu(): number {
    return this.#systemData.stats.lu.value;
  }

  get #systemData() {
    return this as this & SmtActor["system"];
  }
}

export const ACTORMODELS = {
  character: SmtCharacterDataModel,
} as const;
