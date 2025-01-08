import { ITEMMODELS } from "../../data-models/item/item-data-model.js";
import { SmtActiveEffect } from "../../helpers/active-effects.js";
import { SmtActor } from "../actor/actor.js";

export type SmtAction = Subtype<SmtItem, "action">;
export type SmtSkill = Subtype<SmtItem, "skill">;

export class SmtItem extends Item<
  typeof ITEMMODELS,
  SmtActor,
  SmtActiveEffect
> {}
