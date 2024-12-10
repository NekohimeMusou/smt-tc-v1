import { SmtActor } from "../documents/actor/actor.js";

type SuccessLevel = "success" | "failed" | "crit" | "fumble";

interface SuccessRollOptions {
  token?: TokenDocument<SmtActor>;
  actor?: SmtActor;
  showDialog?: boolean;
  hasCritBoost?: boolean;
}

declare global {
  type TNRollType = "tn" | "specialTN";
  interface TNRollData {
    rollType: TNRollType;
    stat: SmtStat;
  }
}

// RollData can access actor through "parent" attribute
export async function successRoll(
  rollLabel: string,
  tn: number,
  {
    token,
    actor,
    showDialog = false,
    hasCritBoost = false,
  }: SuccessRollOptions = {},
) {
  const checkLabel = game.i18n.format("SMT.dice.checkMsg", {
    rollLabel,
    tn: `${tn}`,
  });

  const { mod, cancelled } = showDialog
    ? await showSuccessModDialog(checkLabel)
    : { mod: 0, cancelled: false };

  if (cancelled) return;

  const modifiedTN = tn + (mod || 0);

  const modifiedCheckLabel = game.i18n.format("SMT.dice.checkMsg", {
    rollLabel,
    tn: `${modifiedTN}`,
  });

  const msgParts = [`<p>${modifiedCheckLabel}</p>`];

  const roll = await new Roll("1d100").roll();

  const rollTotal = roll.total;

  const critDivisor = hasCritBoost ? 5 : 10;

  const critThreshold = Math.max(Math.floor(modifiedTN / critDivisor), 1);

  const successLevel = getSuccessLevel(rollTotal, modifiedTN, critThreshold);

  const resultLabel = game.i18n.localize(`SMT.dice.result.${successLevel}`);

  const rollHTML = await roll.render();

  msgParts.push(`<h3>${resultLabel}</h3>`, rollHTML);

  const chatData = {
    user: game.user.id,
    // flavor: optional flavor text
    content: msgParts.join("\n"),
    speaker: {
      scene: game.scenes.current,
      token,
      actor,
    },
    rolls: [roll],
  };

  return await ChatMessage.create(chatData);
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
  }

  return "failed";
}

async function showSuccessModDialog(
  checkLabel: string,
): Promise<{ mod?: number; cancelled?: boolean }> {
  const template =
    "systems/smt-tc/templates/dialog/success-roll-mod-dialog.hbs";
  const content = await renderTemplate(template, { checkLabel });

  return new Promise((resolve) =>
    new Dialog(
      {
        title: game.i18n.localize("SMT.dice.modifier"),
        content,
        buttons: {
          ok: {
            label: "OK",
            callback: (html) =>
              resolve({
                mod: parseInt(
                  $(html)[0].querySelector("form")?.mod?.value || 0,
                ),
              }),
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve({ cancelled: true }),
          },
        },
        default: "ok",
        close: () => resolve({ cancelled: true }),
      },
      {},
    ).render(true),
  );
}
