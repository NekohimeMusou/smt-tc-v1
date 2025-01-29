import { SmtToken } from "../documents/token.js";

export async function resolveConflict() {
  const tokens = canvas.tokens.controlled as SmtToken[];

  if (tokens.length < 1) {
    ui.notifications.notify("SMT.ui.noTokensSelected");
    return;
  }

  const xp = tokens.reduce((acc, curr) => acc + curr.actor.system.xpAward, 0);
  const macca = tokens.reduce(
    (acc, curr) => acc + curr.actor.system.maccaAward,
    0,
  );
  const itemDrops = tokens
    .filter((token) => token.actor.system.itemDrops)
    .map((token) => token.actor.system.itemDrops);

  const template = "systems/smt-tc/templates/chat/combat-result.hbs";
  const content = await renderTemplate(template, { xp, macca, itemDrops });

  const chatData = {
    user: game.user.id,
    content,
    speaker: {
      scene: game.scenes.current,
      alias: "Kagutsuchi",
    },
  };

  await ChatMessage.create(chatData);
}
