import { SmtActor } from "./actor/actor.js";

export class SmtToken extends Token<SmtActor> {
  declare isOwner: boolean;
}

export class SmtTokenDocument extends TokenDocument<SmtActor> {}
