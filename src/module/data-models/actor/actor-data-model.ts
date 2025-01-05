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
  };
}

const tn = new fields.SchemaField({
  st: new fields.NumberField({ integer: true }),
  ma: new fields.NumberField({ integer: true }),
  vi: new fields.NumberField({ integer: true }),
  ag: new fields.NumberField({ integer: true }),
  lu: new fields.NumberField({ integer: true }),
  physAtk: new fields.NumberField({ integer: true }),
  magAtk: new fields.NumberField({ integer: true }),
  save: new fields.NumberField({ integer: true }),
  dodge: new fields.NumberField({ integer: true }),
  negotiation: new fields.NumberField({ integer: true }),
});

const power = new fields.SchemaField({
  phys: new fields.NumberField({ integer: true, min: 0 }),
  mag: new fields.NumberField({ integer: true, min: 0 }),
  gun: new fields.NumberField({ integer: true, min: 0 }),
});

const resist = new fields.SchemaField({
  phys: new fields.NumberField({ integer: true, min: 0 }),
  mag: new fields.NumberField({ integer: true, min: 0 }),
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
  pierce: new fields.BooleanField(),
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
    physPower: new fields.NumberField({ integer: true, min: 0 }),
    magPower: new fields.NumberField({ integer: true, min: 0 }),
    accuracy: new fields.NumberField({ integer: true, min: 0 }),
    resist: new fields.NumberField({ integer: true, min: 0 }),
  }),
  debuffs: new fields.SchemaField({
    physPower: new fields.NumberField({ integer: true, min: 0 }),
    magPower: new fields.NumberField({ integer: true, min: 0 }),
    accuracy: new fields.NumberField({ integer: true, min: 0 }),
    resist: new fields.NumberField({ integer: true, min: 0 }),
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
      xp: new fields.NumberField({ integer: true, min: 0 }),
      level: new fields.NumberField({ integer: true, min: 0, initial: 1 }),
      notes: new fields.HTMLField(),
      hpMultiplier: new fields.NumberField({ integer: true, min: 1 }),
      mpMultiplier: new fields.NumberField({ integer: true, min: 1 }),
      autoFailThreshold: new fields.NumberField({ integer: true, initial: 96 }),
      macca: new fields.NumberField({ integer: true, min: 0 }),
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
      stat.value = Math.max(stat.base + stat.lv + magatamaBonus, 1);
    }

    // Get HP and MP multipliers
    const isHuman = data.charClass === "human";
    // @ts-expect-error This field isn't readonly
    data.hpMultiplier = (isHuman ? 4 : 6) + (data.resourceBoost.hp ?? 0);
    // @ts-expect-error This field isn't readonly
    data.mpMultiplier = (isHuman ? 2 : 3) + (data.resourceBoost.mp ?? 0);

    // Add phys/mag resist from equipment
    const actor = this.parent as SmtActor;
    const equipment = actor.items.filter((item) => item.system.equipped);
    const equipPhysResist =
      data.charClass !== "human"
        ? 0
        : equipment
            .map((item) => item.system.resistBonus.phys)
            .reduce((prev, curr) => prev + curr, 0);
    const equipMagResist =
      data.charClass !== "human"
        ? 0
        : equipment
            .map((item) => item.system.resistBonus.mag)
            .reduce((prev, curr) => prev + curr, 0);

    data.resist.phys = Math.max(
      Math.floor((stats.vi.value + data.level) / 2) +
        data.buffs.resist -
        data.debuffs.resist +
        data.resistBonus.phys +
        equipPhysResist,
      0,
    );
    data.resist.mag = Math.max(
      Math.floor((stats.ma.value + data.level) / 2) +
        data.buffs.resist -
        data.debuffs.resist +
        data.resistBonus.mag +
        equipMagResist,
      0,
    );

    // Calculate power and resistance
    data.power.phys = Math.max(
      stats.st.value +
        data.level +
        data.buffs.physPower -
        data.debuffs.physPower,
      0,
    );
    data.power.mag = Math.max(
      stats.ma.value + data.level + data.buffs.magPower - data.debuffs.magPower,
      0,
    );
    data.power.gun = Math.max(
      stats.ag.value + data.buffs.physPower - data.debuffs.physPower,
      0,
    );
  }

  override prepareDerivedData() {
    const data = this.#systemData;

    const stats = data.stats;
    const tnBoostMod = data.tnBoosts * 20;

    Object.entries(stats).forEach(([key, stat]) => {
      const statName = key as keyof typeof stats;
      const derivedStatName = CONFIG.SMT.derivedTNStats[statName];

      let derivedTNValue = stat.value * 5 + data.level + tnBoostMod;

      data.tn[statName] = Math.max(Math.floor(derivedTNValue / data.multi), 1);

      switch (statName) {
        case "vi":
          derivedTNValue -= tnBoostMod;
          break;
        case "ag":
          derivedTNValue =
            stat.value +
            10 +
            data.dodgeBonus +
            data.buffs.accuracy -
            data.debuffs.accuracy;
          break;
        case "lu":
          derivedTNValue = data.tn.negotiation = stat.value * 2 + 20;
          break;
      }

      data.tn[derivedStatName] = Math.max(derivedTNValue, 1);
    });

    // Calculate HP/MP/FP max
    data.hp.max = Math.max(
      (stats.vi.value + data.level) * data.hpMultiplier,
      1,
    );
    data.mp.max = Math.max(
      (stats.ma.value + data.level) * data.mpMultiplier,
      1,
    );
    data.fp.max = Math.max(Math.floor(stats.lu.value / 5 + 5), 1);
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
