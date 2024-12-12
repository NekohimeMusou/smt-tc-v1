import { SmtActor } from "../documents/actor/actor.js";

enum SuccessLevel {
  Success = "success",
  Failed = "failed",
  Crit = "crit",
  Fumble = "fumble",
}

interface RollOptions {
  rollName?: string;
  token?: TokenDocument<SmtActor>;
  actor?: SmtActor;
  showDialog?: boolean;
}

interface SuccessRollOptions extends RollOptions {
  hasCritBoost?: boolean;
  baseTn?: number;
  autoFailThreshold?: number;
}

interface PowerRollOptions extends RollOptions {
  basePower?: number;
  potency?: number;
  hasPowerBoost?: boolean;
  affinity?: Affinity;
  atkCategory?: AttackCategory;
}

interface ModElement extends HTMLElement {
  mod?: {value?: string; };
};

// interface AilmentData {
//   name: string;
//   accuracy: number;
// }

declare global {
  interface SuccessRollData {
    rollType: SuccessRollCategory;
    stat: CharacterStat;
  }

  // TODO: Figure out what info I need from the sheet
  interface PowerRollData {
    rollName?: string;
    atkCategory?: AttackCategory;
    affinity?: Affinity;
    basePower?: number;
  }
}

export async function successRoll({
  rollName = "",
  token,
  actor,
  showDialog = false,
  hasCritBoost = false,
  autoFailThreshold = 96,
  baseTn = 0,
}: SuccessRollOptions = {}) {
  const tn = Math.min(baseTn, autoFailThreshold);

  const dialogLabel = game.i18n.format("SMT.dice.checkMsg", {
    rollName,
    tn: `${tn}`,
  });

  const { mod, cancelled } = showDialog
    ? await showModifierDialog(
        dialogLabel,
        game.i18n.localize("SMT.dice.modifierHint"),
      )
    : { mod: 0, cancelled: false };

  if (cancelled) return;

  const modifiedTN = tn + (mod ?? 0);

  const modifiedCheckLabel = game.i18n.format("SMT.dice.checkMsg", {
    rollName,
    tn: `${modifiedTN}`,
  });

  const msgParts = [`<p>${modifiedCheckLabel}</p>`];

  const roll = await new Roll("1d100").roll();

  const rollTotal = roll.total;

  const critDivisor = hasCritBoost ? 5 : 10;

  // A 1 is always a crit
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
    return SuccessLevel.Fumble;
  } else if (roll <= critThreshold) {
    return SuccessLevel.Crit;
  } else if (roll <= tn) {
    return SuccessLevel.Success;
  }

  return SuccessLevel.Failed;
}

async function showModifierDialog(
  dialogLabel: string,
  hint = "",
): Promise<{ mod?: number; cancelled?: boolean }> {
  const template = "systems/smt-tc/templates/dialog/modifier-dialog.hbs";
  const content = await renderTemplate(template, {
    checkLabel: dialogLabel,
    hint,
  });

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
                  ($(html)[0].querySelector("form") as ModElement)?.mod?.value ?? "0",
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
  rollName = "Generic",
  token,
  actor,
  showDialog,
  basePower = 0,
  potency = 0,
  hasPowerBoost,
  affinity = "unique",
  atkCategory = "phys",
}: PowerRollOptions = {}) {
  const dialogLabel = game.i18n.format("SMT.dice.powerDialogMsg", {
    name: rollName,
  });

  const { mod, cancelled } = showDialog
    ? await showModifierDialog(dialogLabel)
    : { mod: 0, cancelled: false };

  if (cancelled) return;

  const diceMod = mod ?? 0;

  const rollString = [
    `${hasPowerBoost ? 2 : 1}d10x`,
    _getDiceTerm(basePower),
    _getDiceTerm(potency),
    _getDiceTerm(diceMod),
  ].join("");

  const roll = await new Roll(rollString).roll();

  const powerTotalString = game.i18n.format("SMT.dice.powerChatCardMsg", {
    power: `${roll.total}`,
    affinity: game.i18n.localize(`SMT.affinities.${affinity}`),
    atkCategory: game.i18n.localize(`SMT.atkCategory.${atkCategory}`),
  });

  const content = [
    `<h3>${rollName}</h3>`,
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
  if (!num) {
    return "";
  }

  return Math.sign(num) < 0 ? ` - ${num}` : ` + ${num}`;
}
