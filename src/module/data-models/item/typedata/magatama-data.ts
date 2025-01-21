import affinityData from "../../shared/affinities.js";
import statData from "../../shared/stats.js";

export function magatamaData() {
  const fields = foundry.data.fields;

  return {
    affinities: new fields.SchemaField(affinityData()),
    stats: new fields.SchemaField(statData()),
    // Up to 6 skills, except Masakados which has 7
    skills: new fields.ArrayField(
      new fields.EmbeddedDataField(MagatamaSkillDM),
    ),
  } as const;
}

class MagatamaSkillDM extends foundry.abstract.DataModel {
  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      learnLevel: new fields.NumberField({ integer: true, min: 1 }),
      name: new fields.StringField(),
    };
  }
}
