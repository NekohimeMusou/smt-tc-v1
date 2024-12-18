import { SmtActor } from "../documents/actor/actor.js";

export async function createBasicStrike(document: SmtActor, options: DatabaseCreateOperation, userId: string) {
  if (userId !== game.user.id) return;

  await document.createEmbeddedDocuments("Item", [
    {
      name: "Basic Strike",
      type: "weapon",
      img: "icons/skills/melee/unarmed-punch-fist.webp",
      system: { basicStrike: true },
    },
  ]);
}
