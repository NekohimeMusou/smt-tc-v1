import { SmtActor } from "../documents/actor/actor.js";

type SuccessLevel = "success" | "failed" | "crit" | "fumble";

// RollData can access actor through "parent" attribute
export async function successRoll(
  rollLabel: string,
  tn: number,
  {
    // token,
    // actor,
    hasCritBoost = false,
  }: {
    token?: TokenDocument<SmtActor>;
    actor?: SmtActor;
    hasCritBoost?: boolean;
  } = {},
) {
  const checkLabel = game.i18n.format("SMT.dice.checkMsg", {
    rollLabel,
    tn: `${tn}`,
  });

  const msgParts = [`<p>${checkLabel}</p>`];

  const roll = await new Roll("1d100").roll();

  const rollTotal = roll.total;

  const critDivisor = hasCritBoost ? 5 : 10;

  const critThreshold = Math.max(Math.floor(tn / critDivisor), 1);

  const successLevel = getSuccessLevel(rollTotal, tn, critThreshold);

  const resultLabel = game.i18n.localize(`SMT.dice.result.${successLevel}`);

  msgParts.push(`<h3>${resultLabel}</h3>\n<p>Roll: ${rollTotal}</p>`);

  // const chatData = {
  //   user: game.user.id,
  //   // flavor: optional flavor text
  //   content: msgParts.join("\n"),
  //   speaker: {
  //     scene: game.scenes.current,
  //     token,
  //     actor,
  //   },
  // };

  // return await ChatMessage.create(chatData);
  // return await roll.toMessage(chatData);
  return await roll.toMessage();
}

function getSuccessLevel(
  roll: number,
  tn: number,
  critThreshold: number,
): SuccessLevel {
  if (roll === 100) {
    return "fumble";
  } else if (roll <= critThreshold) {
    return "crit";
  } else if (roll <= tn) {
    return "success";
  } else {
    return "failed";
  }
}

declare global {
  type TNRollType = "tn" | "specialTN";
  interface TNRollData {
    rollType: TNRollType;
    stat: SmtStat;
  }
}
