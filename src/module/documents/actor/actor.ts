import { ACTORMODELS } from "../../data-models/actor/actor-model.js";
import { SmtItem } from "../item/item.js";

export class SmtActor extends Actor<typeof ACTORMODELS, SmtItem> {
  override getRollData() {
    const rollData = super.getRollData();

    const stats = Object.fromEntries(
      Object.entries(this.system.stats).map(([statName, stat]) => [
        statName,
        stat.value,
      ]),
    );

    foundry.utils.mergeObject(rollData, stats);

    return rollData;
  }
}
