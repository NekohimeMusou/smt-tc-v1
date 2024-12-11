export class SkillDataModel extends foundry.abstract.TypeDataModel {
  get type() {
    return "skill" as const;
  }

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      notes: new fields.HTMLField(),
      stat: new fields.StringField(),
      potency: new fields.NumberField({ integer: true }),
    } as const;
  }
}

export const ITEMMODELS = {
  skill: SkillDataModel,
} as const;
