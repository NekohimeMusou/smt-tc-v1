import { SmtActor } from "../documents/actor/actor.js";

type SuccessLevel = "success" | "failed" | "crit" | "fumble";

interface RollOptions {
  rollLabel?: string;
  token?: TokenDocument<SmtActor>;
  actor?: SmtActor;
  showDialog?: boolean;
}
interface SuccessRollOptions extends RollOptions {
  hasCritBoost?: boolean;
  tn?: number;
}

interface PowerRollOptions extends RollOptions {
  basePower?: number;
  potency?: number;
  hasPowerBoost?: boolean;
  element?: SmtElement;
  atkType?: SmtAtkType;
}

interface StatusAilmentData {
  name: string;
  accuracy: number;
}

declare global {
  type TNRollType = "tn" | "specialTN";

  interface TNRollData {
    rollType: TNRollType;
    stat: SmtStat;
  }

  // TODO: Figure out what info I need from the sheet
  interface PowerRollData {

  }
}

// RollData can access actor through "parent" attribute
export async function successRoll(
  {
    rollLabel="",
    token,
    actor,
    showDialog = false,
    hasCritBoost = false,
    tn=0,
  }: SuccessRollOptions = {},
) {
  const dialogLabel = game.i18n.format("SMT.dice.checkMsg", {
    rollLabel,
    tn: `${tn}`,
  });

  const { mod, cancelled } = showDialog
    ? await showModifierDialog(dialogLabel, game.i18n.localize("SMT.dice.modifierHint"))
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
  } else if (roll >= 96) {
    return "failed";
  } else if (roll <= critThreshold) {
    return "crit";
  } else if (roll <= tn) {
    return "success";
  }

  return "failed";
}

async function showModifierDialog(
  dialogLabel: string,
  hint: string="",
): Promise<{ mod?: number; cancelled?: boolean }> {
  const template =
    "systems/smt-tc/templates/dialog/modifier-dialog.hbs";
  const content = await renderTemplate(template, { checkLabel: dialogLabel, hint });

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

export async function powerRoll({
  rollLabel="",
  token,
  actor,
  showDialog,
  basePower=0,
  potency=0,
  hasPowerBoost,
  element,
  atkType,
}: PowerRollOptions={}) {
  const dialogLabel = game.i18n.format("SMT.dice.powerDialogMsg", { name: rollLabel });

  const { mod, cancelled } = showDialog
    ? await showModifierDialog(dialogLabel) : { mod: 0, cancelled: false };

    if (cancelled) return;

    const diceMod = mod || 0;

    const rollString = [
      `${hasPowerBoost ? 2 : 1}d10x`,
      _getDiceTerm(basePower),
      _getDiceTerm(potency),
      _getDiceTerm(diceMod)
    ].join("");

    const roll = await new Roll(rollString).roll();

    const powerTotalString = game.i18n.format("SMT.dice.powerChatCardMsg",
      {
       power: `${roll.total}`,
       element: game.i18n.localize(`SMT.elements.${element}`),
       atkType: game.i18n.localize(`SMT.atkType.${atkType}`),
     });

    const content = [
      `<h3>${rollLabel}</h3>`,
      `<p>${powerTotalString}</p>`,
      await roll.render(),
    ].join("\n");

    const chatData = {
      user: game.user.id,
      content,
      speaker: {
        scene: game.scenes.current,
        token,
        actor,
      },
      rolls: [roll],
    };

    return await ChatMessage.create(chatData);
}

function _getDiceTerm(num: number) {
  if (!num) { return ""; }

  return Math.sign(num) < 0 ? ` - ${num}` : ` + ${num}`
}
