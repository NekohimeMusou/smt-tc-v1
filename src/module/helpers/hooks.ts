export async function createBasicStrike(
  document: Actor,
  options: DatabaseCreateOperation,
  userId: string,
) {
  if (userId !== game.user.id || document.items.getName("Basic Strike")) return;

  await document.createEmbeddedDocuments("Item", [
    {
      name: "Basic Strike",
      type: "unstackable",
      img: "icons/skills/melee/unarmed-punch-fist.webp",
      system: { basicStrike: true, itemType: "skill", hasPowerRoll: true },
    },
  ]);
}
