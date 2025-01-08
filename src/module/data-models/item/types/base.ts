export abstract class BaseItemData extends foundry.abstract.TypeDataModel {
  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      itemType: new fields.StringField({
        choices: CONFIG.SMT.itemTypes,
        initial: "skill",
      }),
      // To be shown in chat card with rolls
      effect: new fields.HTMLField(),
      price: new fields.NumberField({ integer: true, initial: 0 }),
      hasPowerRoll: new fields.BooleanField(),
    };
  }
}
