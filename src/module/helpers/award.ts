import { SmtToken } from "../documents/token.js";

export async function resolveConflict() {
  const tokens = canvas.tokens.controlled as SmtToken[];

  if (tokens.length < 1) {
    ui.notifications.notify(game.i18n.localize("SMT.ui.noTokensSelected"));
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

type LuckyFindResult = "fail" | "success" | "crit";

interface LuckyRollResult {
  name: string;
  result: LuckyFindResult;
  roll: Roll;
}

export async function luckyFindRolls() {
  const tokens = canvas.tokens.controlled as SmtToken[];

  if (tokens.length < 1) {
    ui.notifications.notify(game.i18n.localize("SMT.ui.noTokensSelected"));
    return;
  }

  const luckyFinders = tokens.filter((token) => token.actor.system.luckyFind);

  const luckRollResults = await Promise.all(
    luckyFinders.map(
      async (token) => await luckyFindRoll(token.name, token.actor.system.lu),
    ),
  );

  const [results, rolls] = [
    luckRollResults.map((r) => ({ result: r.result, name: r.name })),
    luckRollResults.map((r) => r.roll),
  ];

  const rollHtml = results.map(
    (r) =>
      `<div>${r.name}: ${game.i18n.localize(`SMT.luckMacro.${r.result}`)}</div>`,
  );

  const header = `<h1>${game.i18n.localize("SMT.luckMacro.title")}</h1>`;
  const content = ["<div>", header, ...rollHtml, "</div>"].join("\n");

  const chatData = {
    user: game.user.id,
    content,
    speaker: {
      scene: game.scenes.current,
      alias: "Kagutsuchi",
    },
    rolls,
  };

  return await ChatMessage.create(chatData);
}

async function luckyFindRoll(
  name: string,
  lk: number,
): Promise<LuckyRollResult> {
  const critThreshold = Math.floor(lk / 10);

  const roll = await new Roll("1d100").roll();

  let result: LuckyFindResult = "fail";

  if (roll.total <= critThreshold) {
    result = "crit";
  } else if (roll.total <= lk) {
    result = "success";
  }

  return { name, result, roll };
}
