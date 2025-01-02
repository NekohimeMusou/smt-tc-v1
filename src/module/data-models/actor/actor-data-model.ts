import { SMT } from "../../config/config.js";
import { SmtActor } from "../../documents/actor/actor.js";

const fields = foundry.data.fields;

function generateResourceSchema() {
  return {
    max: new fields.NumberField({ integer: true }),
    value: new fields.NumberField({ integer: true }),
  };
}

function generateStatSchema() {
  return {
    base: new fields.NumberField({ integer: true, initial: 1 }),
    magatama: new fields.NumberField({ integer: true }),
    lv: new fields.NumberField({ integer: true }),
    value: new fields.NumberField({ integer: true }),
    tn: new fields.NumberField({ integer: true }),
    derivedTN: new fields.NumberField({ integer: true }),
  };
}

const tn = new fields.SchemaField({
  st: new fields.NumberField({ integer: true }),
  ma: new fields.NumberField({ integer: true }),
  vi: new fields.NumberField({ integer: true }),
  ag: new fields.NumberField({ integer: true }),
  lu: new fields.NumberField({ integer: true }),
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

const ailmentMods = {
  curse: new fields.BooleanField(), // Implemented
  panic: new fields.BooleanField(),
  ignorePhysAffinity: new fields.BooleanField(), // Implemented
  physAttacksCrit: new fields.BooleanField(), // Implemented
  noActions: new fields.BooleanField(), // Implemented
  mute: new fields.BooleanField(), // Implemented
  poison: new fields.BooleanField(), // Implemented
  takeDoubleDamage: new fields.BooleanField(), // Implemented
  stone: new fields.BooleanField(), // Implemented for incoming damage mod only
} as const;

const passiveSkillMods = {
  gunAttackBonus: new fields.NumberField({ integer: true, initial: 0 }),
  powerBoost: new fields.SchemaField({
    phys: new fields.BooleanField(),
    mag: new fields.BooleanField(),
    item: new fields.BooleanField(),
  }),
  might: new fields.BooleanField(),
  elementBoosts: new fields.SchemaField({
    fire: new fields.BooleanField(),
    cold: new fields.BooleanField(),
    elec: new fields.BooleanField(),
    force: new fields.BooleanField(),
  }),
  resourceBoost: new fields.SchemaField({
    hp: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
    mp: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
  }),
  dodgeBonus: new fields.NumberField({ integer: true, initial: 0 }),
} as const;

const modifiers = {
  focused: new fields.BooleanField({ initial: false }),
  // IMPLEMENT
  tnBoosts: new fields.NumberField({ integer: true, initial: 0 }), // +/- 20 TN bonuses from the sheet
  multi: new fields.NumberField({
    integer: true,
    initial: 1,
    positive: true,
    max: 3,
  }),
  resistBonus: new fields.SchemaField({
    phys: new fields.NumberField({ integer: true, initial: 0 }),
    mag: new fields.NumberField({ integer: true, initial: 0 }),
  }),
  // TODO: Make these into AEs somehow
  // -kaja and -kunda spells
  buffs: new fields.SchemaField({
    physPower: new fields.NumberField({ integer: true }),
    magPower: new fields.NumberField({ integer: true }),
    accuracy: new fields.NumberField({ integer: true }),
    resist: new fields.NumberField({ integer: true }),
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
        initial: "demon",
      }),
      xp: new fields.NumberField({ integer: true, initial: 0 }),
      level: new fields.NumberField({ integer: true, initial: 1 }),
      notes: new fields.HTMLField(),
      hpMultiplier: new fields.NumberField({ integer: true }),
      mpMultiplier: new fields.NumberField({ integer: true }),
      autoFailThreshold: new fields.NumberField({ integer: true, initial: 96 }),
      macca: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      affinities,
      stats,
      tn,
      power,
      resist,
      ...passiveSkillMods,
      ...ailmentMods,
      ...modifiers,
      ...resources,
    } as const;
  }

  override prepareBaseData() {
    const data = this.#systemData;

    const stats = data.stats;

    for (const stat of Object.values(stats)) {
      const magatamaBonus = data.charClass === "fiend" ? stat.magatama : 0;
      stat.value = stat.base + stat.lv + magatamaBonus;
    }

    // Get HP and MP multipliers
    const isHuman = data.charClass === "human";
    // @ts-expect-error This field isn't readonly
    data.hpMultiplier = (isHuman ? 4 : 6) + (data.resourceBoost.hp ?? 0);
    // @ts-expect-error This field isn't readonly
    data.mpMultiplier = (isHuman ? 2 : 3) + (data.resourceBoost.mp ?? 0);

    data.resist.phys =
      Math.floor((stats.vi.value + data.level) / 2) +
      data.buffs.resist +
      data.resistBonus.phys;
    data.resist.mag =
      Math.floor((stats.ma.value + data.level) / 2) +
      data.buffs.resist +
      data.resistBonus.mag;

    // Calculate power and resistance
    data.power.phys = stats.st.value + data.level + data.buffs.physPower;
    data.power.mag = stats.ma.value + data.level + data.buffs.magPower;
    data.power.gun = stats.ag.value + data.buffs.physPower;
  }

  override prepareDerivedData() {
    const data = this.#systemData;

    const stats = data.stats;
    const tnBoostMod = data.tnBoosts * 20;

    for (const statData of Object.entries(stats)) {
      const key = statData[0] as keyof typeof data.tn;
      const stat = statData[1];

      data.tn[key] = stat.value * 5 + data.level;
      stat.tn = data.tn[key];
      switch (key) {
        case "vi":
          data.tn.save = stat.value * 5 + data.level;
          stat.derivedTN = stat.value * 5 + data.level;
          break;
        case "ag":
          data.tn.dodge =
            stat.value + 10 + data.dodgeBonus + data.buffs.accuracy;
          stat.derivedTN =
            stat.value + 10 + data.dodgeBonus + data.buffs.accuracy;
          break;
        case "lu":
          data.tn.negotiation = stat.value * 2 + 20;
          stat.derivedTN = stat.value * 2 + 20;
          break;
        default:
          stat.derivedTN = stat.value * 5 + data.level;
      }
    }

    Object.values(stats).forEach((stat) => (stat.tn += tnBoostMod));
    Object.values(stats).forEach(
      (stat) => (stat.tn = Math.floor(stat.tn / data.multi)),
    );

    // Calculate HP/MP/FP max
    data.hp.max = (stats.vi.value + data.level) * data.hpMultiplier;
    data.mp.max = (stats.ma.value + data.level) * data.mpMultiplier;
    data.fp.max = Math.floor(stats.lu.value / 5 + 5);
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
