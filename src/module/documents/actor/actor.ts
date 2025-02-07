import { SmtStatusId } from "../../config/statuses.js";
import { ACTORMODELS } from "../../data-models/actor/actor-data-model.js";
import { SmtActiveEffect } from "../../helpers/active-effects.js";
import { SmtItem } from "../item/item.js";

type StatusData = StatusEffectObject & { statuses?: Set<string> };

type StatusChangeMode = "on" | "off" | "toggle";

export class SmtActor extends Actor<
  typeof ACTORMODELS,
  SmtItem,
  SmtActiveEffect
> {
  async changeStatus(id: SmtStatusId, mode: StatusChangeMode) {
    const originalEffect = this.effects.find((e) => e.statuses.has(id));

    if (originalEffect && mode !== "on") {
      // If it's "off" or "toggle" and the effect is on, switch it off
      await this.deleteEmbeddedDocuments("ActiveEffect", [originalEffect.id]);
    } else if (!originalEffect && mode !== "off") {
      // If it's "on" or "toggle" and the effect is off, switch it on
      const effectData = CONFIG.statusEffects.find((e) => e.id === id);
      if (!effectData)
        return ui.notifications.error(`Status ID not found: ${id}`);
      const newEffect = foundry.utils.deepClone(effectData) as StatusData;

      newEffect.statuses = new Set<SmtStatusId>([id]);

      newEffect.name = game.i18n.localize(newEffect.name);

      await this.createEmbeddedDocuments("ActiveEffect", [newEffect]);
    }
  }

  async paySkillCost(cost: number, costType: CostType) {
    if (this.system[costType].value < cost) {
      return false;
    }

    const newVal = this.system[costType].value - cost;
    await this.update(
      Object.fromEntries([[`system.${costType}.value`, newVal]]),
    );

    return true;
  }

  async healingFountain(): Promise<HealingFountainResult> {
    const data = this.system;

    const hpAmount = Math.max(data.hp.max - data.hp.value, 0);
    const mpAmount = Math.max(data.mp.max - data.mp.value, 0);

    const healingCost = hpAmount + mpAmount * 2;

    if (healingCost < 1) {
      return {};
    }

    if (data.macca < healingCost) {
      ui.notifications.notify(`Insufficient macca: ${this.name}`);
      return { insufficientMacca: true, healingCost };
    }

    const updateData = {
      "system.macca": data.macca - healingCost,
      "system.hp.value": data.hp.max,
      "system.mp.value": data.mp.max,
    };

    await this.update(updateData);

    return { healed: true, hpAmount, mpAmount, healingCost };
  }
}

interface HealingFountainResult {
  healed?: boolean;
  insufficientMacca?: boolean;
  hpAmount?: number;
  mpAmount?: number;
  healingCost?: number;
}
