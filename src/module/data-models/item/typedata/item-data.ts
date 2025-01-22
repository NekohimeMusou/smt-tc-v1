import { SmtActor } from "../../../documents/actor/actor.js";
import { SMTBaseAttackDM } from "../types/attack.js";
import { sharedAttackData } from "./shared-attack-data.js";
import { sharedInventoryData } from "./shared-inventory-data.js";

export class SMTItemDM extends SMTBaseAttackDM {
  override readonly itemType = "item";

  static override defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      ...sharedAttackData(),
      ...sharedInventoryData(),
      consumableType: new fields.StringField({
        choices: CONFIG.SMT.consumableTypes,
        initial: "rock",
      }),
    } as const;
  }

  override prepareDerivedData() {
    const data = this.systemData;

    // Consumable items always auto-hit
    // @ts-expect-error This isn't readonly
    data.auto = true;
  }

  override readonly accuracyStat = "auto";

  override readonly tn = 100;

  override get damageType(): DamageType {
    const data = this.systemData;

    return data.consumableType === "grenade" ? "phys" : "mag";
  }

  override get power(): number {
    const actor = this.parent?.parent as SmtActor;
    const data = this.systemData;

    const consumableType = data.consumableType;

    const powerStat = consumableType === "grenade" ? "gun" : "mag";

    const basePower = actor.system.power[powerStat];

    return basePower + data.potency;
  }

  override readonly powerBoostType = "item";

  override get powerBoost(): boolean {
    const powerBoostType = this.systemData.powerBoostType;
    const actor = this.parent?.parent as SmtActor | undefined;

    return actor?.system.powerBoost[powerBoostType] ?? false;
  }

  override readonly critBoost = false;
}
