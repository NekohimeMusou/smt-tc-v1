import { ACTORMODELS } from "../../data-models/actor/actor-model.js";
import { SmtItem } from "../item/item.js";

export class SmtActor extends Actor<typeof ACTORMODELS, SmtItem> {}
