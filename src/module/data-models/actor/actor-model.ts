import { SmtActor } from "../../documents/actor/actor.js";
import { generateResourceSchema } from "./fields/resources.js";
import { generateStatSchema } from "./fields/stats.js";

const fields = foundry.data.fields;

const charClasses = ["human", "demon", "fiend"];

const tn = new fields.SchemaField({
  basicStrike: new fields.NumberField({ integer: true }),
  spell: new fields.NumberField({ integer: true }),
  save: new fields.NumberField({ integer: true }),
  dodge: new fields.NumberField({ integer: true }),
  negotiation: new fields.NumberField({ integer: true }),
});

const power = new fields.SchemaField({
  phys: new fields.NumberField({ integer: true }),
  mag: new fields.NumberField({ integer: true }),
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

export class CharacterDataModel extends foundry.abstract.TypeDataModel {
  get type() {
    return "character" as const;
  }
  static override defineSchema() {
    return {
      charClass: new fields.StringField({
        choices: charClasses,
        initial: "human",
      }),
      xp: new fields.NumberField({ integer: true, initial: 0 }),
      level: new fields.NumberField({ integer: true, initial: 1 }),
      notes: new fields.HTMLField(),
      hpMultiplier: new fields.NumberField({ integer: true }),
      mpMultiplier: new fields.NumberField({ integer: true }),
      stats,
      tn,
      power,
      resist,
      ...resources,
    } as const;
  }

  override prepareDerivedData() {
    const data = this.#systemData;

    const stats = data.stats;

    // Calculate stat totals and TNs
    for (const [key, stat] of Object.entries(stats)) {
      stat.value = stat.base + stat.lv + stat.magatama;
      stat.tn = stat.value * 5 + data.level;
      // Calculate the "special" TN associated with each stat
      switch (key) {
        case "st":
        case "ma":
        case "vi":
          stat.specialTN = stat.tn;
          break;
        case "ag":
          stat.specialTN = stat.value + 10;
          break;
        case "lu":
          stat.specialTN = stat.value * 2 + 20;
          break;
      }
    }

    // Calculate secondary TNs
    data.tn.basicStrike = stats.st.tn;
    data.tn.spell = stats.ma.tn;
    data.tn.save = stats.vi.tn;
    data.tn.dodge = stats.ag.value + 10;
    data.tn.negotiation = stats.lu.value * 2 + 20;

    // Get HP and MP multipliers
    const isHuman = data.charClass === "human";
    // @ts-expect-error This field isn't readonly
    data.hpMultiplier = isHuman ? 4 : 6;
    // @ts-expect-error This field isn't readonly
    data.mpMultiplier = isHuman ? 2 : 4;

    // Calculate HP/MP/FP max
    data.hp.max = stats.vi.value + data.level + data.hpMultiplier;
    data.mp.max = stats.ma.value + data.level + data.mpMultiplier;
    data.fp.max = Math.floor(stats.lu.value / 5 + 5);

    // Calculate power and resistance
    data.power.phys = stats.st.value + data.level;
    data.power.mag = stats.ma.value + data.level;

    data.resist.phys = Math.floor((stats.vi.value + data.level) / 2);
    data.resist.mag = Math.floor((stats.ma.value + data.level) / 2);
  }

  get #systemData() {
    return this as this & SmtActor["system"];
  }
}

export const ACTORMODELS = {
  character: CharacterDataModel,
} as const;
