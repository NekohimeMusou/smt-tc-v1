import { ACTORMODELS } from "../../data-models/actor/actor-data-model.js";
import { SmtItem } from "../item/item.js";

export class SmtActor extends Actor<typeof ACTORMODELS, SmtItem> {}
