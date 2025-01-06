import { ITEMMODELS } from "../../data-models/item/item-data-model.js";
import { SmtActiveEffect } from "../../helpers/active-effects.js";
import { SmtActor } from "../actor/actor.js";

export class SmtItem extends Item<
  typeof ITEMMODELS,
  SmtActor,
  SmtActiveEffect
> {}
