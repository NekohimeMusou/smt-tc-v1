export abstract class SmtBaseItemDM extends foundry.abstract.TypeDataModel {
  abstract get itemType(): ItemType;

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      itemType: new fields.StringField({
        choices: CONFIG.SMT.itemTypes,
        initial: "skill",
      }),
      effect: new fields.HTMLField(),
    } as const;
  }
}
