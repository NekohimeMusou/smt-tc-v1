import { SmtStatusId } from "../../config/statuses.js";
import { ACTORMODELS } from "../../data-models/actor/actor-data-model.js";
import { SmtActiveEffect } from "../../helpers/active-effects.js";
import { SmtAction, SmtItem } from "../item/item.js";

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

      await this.createEmbeddedDocuments("ActiveEffect", [newEffect]);
    }
  }

  getActions(actor: SmtActor) {
    const actions = actor.items.filter((item) => item.type === "action");

    return actions as SmtAction[];
  }
}
