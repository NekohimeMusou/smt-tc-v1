import { sharedItemFields } from "../fields/shared-fields.js";
import { skillFields } from "../fields/skill-fields.js";

export class SmtWeaponDataModel extends foundry.abstract.TypeDataModel {
  get type() {
    return "weapon" as const;
  }

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ammo: new fields.SchemaField({
        min: new fields.NumberField({ integer: true, initial: 0 }),
        max: new fields.NumberField({ integer: true, initial: 0, min: 0 }),
        value: new fields.NumberField({ integer: true, initial: 0 }),
      }),
      ...skillFields(),
      ...sharedItemFields(),
    } as const;
  }
}
