import { ITEMMODELS } from "../../data-models/item/item-data-model.js";
import { SmtActiveEffect } from "../../helpers/active-effects.js";
import { SmtActor } from "../actor/actor.js";

export class SmtItem extends Item<
  typeof ITEMMODELS,
  SmtActor,
  SmtActiveEffect
> {
  async addItemsToStack(qty: number) {
    const data = this.system;

    await this.update({ "system.qty": Math.max(data.qty + qty, 0) });
  }

  async consumeItem() {
    const data = this.system;

    // Don't do anything if there's no actor
    if (!this.parent || !data.consume) {
      return;
    }

    if (data.qty <= 1) {
      await this.delete();
    }

    await this.update({ "system.qty": data.qty - 1 });
  }
}
