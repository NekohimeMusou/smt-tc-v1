import { SmtCharacterDataModel } from "../data-models/actor/actor-data-model.js";
import { SmtActor } from "../documents/actor/actor.js";
import { SmtItem } from "../documents/item/item.js";

interface ModElement extends HTMLElement {
  mod?: { value?: string };
  critBoost?: { value?: boolean };
}

interface ModDialogResult {
  mod?: number;
  cancelled?: boolean;
  critBoost?: boolean;
}

interface ResultLabelOptions {
  rollTotal?: number;
  tn?: number;
  critThreshold?: number;
  autoFailThreshold?: number;
}

// interface AilmentData {
//   name: Ailment;
//   accuracy: number;
// }

function getResultLabel({
  rollTotal = 100,
  tn = 1,
  critThreshold = 1,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: ResultLabelOptions = {}) {
  if (rollTotal >= 100) {
    return game.i18n.localize("SMT.diceResult.fumble");
  } else if (rollTotal >= autoFailThreshold) {
    return game.i18n.format("SMT.diceResult.autofail", {
      threshold: `${autoFailThreshold}`,
    });
  } else if (rollTotal <= critThreshold) {
    const critMsg = game.i18n.localize("SMT.diceResult.crit");
    const critHint = game.i18n.localize("SMT.diceResult.critHint");
    return `<div class=flexcol><div>${critMsg}</div><div>${critHint}</div></div>`;
  } else if (rollTotal <= tn) {
    return game.i18n.localize("SMT.diceResult.success");
  }

  return game.i18n.localize("SMT.diceResult.fail");
}

interface ModDialogData {
  checkName?: string;
  hint?: string;
  hasCritBoost?: boolean;
}

async function renderSuccessModDialog({
  checkName = "",
  hint = "",
  hasCritBoost = false,
}: ModDialogData = {}): Promise<ModDialogResult> {
  const template =
    "systems/smt-tc/templates/dialog/success-modifier-dialog.hbs";
  const content = await renderTemplate(template, {
    checkName,
    hint,
    hasCritBoost,
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
                mod:
                  parseInt(
                    ($(html)[0].querySelector("form") as ModElement)?.mod
                      ?.value ?? "0",
                  ) || 0, // Avoid NaN
                critBoost:
                  ($(html)[0].querySelector("form") as ModElement)?.critBoost
                    ?.value ?? false,
              }),
          },
          cancel: {
            label: "Cancel",
            callback: () =>
              resolve({ mod: 0, cancelled: true, critBoost: false }),
          },
        },
        default: "ok",
        close: () => resolve({ mod: 0, cancelled: true, critBoost: false }),
      },
      {},
    ).render(true),
  );
}

interface OldSuccessRollData {
  checkName?: string;
  tn?: number;
  critBoost?: boolean;
  autoFailThreshold?: number;
}

interface SuccessRollData {
  checkName?: string;
  baseTN?: number;
  hasCritBoost?: boolean;
  autoFailThreshold?: number;
  isStatCheck?: boolean;
  showDialog?: boolean;
}

// 1) Form original roll name w/ unmodified TN
// 2) Show dialog
// 3) Form checkName w/ modified TN

// Expects a name like "Heat Wave" or "St Check"; adds other stuff around it
async function successRoll({
  checkName = "",
  hasCritBoost = false,
  baseTN = 1,
  showDialog = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: SuccessRollData = {}) {
  const dialogCheckLabel = game.i18n.format("SMT.skillCheckLabel", {
    checkName,
    tn: `${baseTN}`,
  });

  const hint = game.i18n.localize("SMT.dice.modifierHint");

  const { mod, cancelled, critBoost } = showDialog
    ? await renderSuccessModDialog({
        checkName: dialogCheckLabel,
        hint,
        hasCritBoost,
      })
    : { mod: 0, cancelled: false, critBoost: hasCritBoost };

  if (cancelled) return { htmlParts: [], rolls: [] };

  const tn = baseTN + (mod ?? 0);

  // Modified check name
  const modifiedCheckName = game.i18n.format("SMT.dice.skillCheckLabel", {
    checkName,
    tn: `${tn}`,
  });

  const critDivisor = critBoost ? 5 : 10;
  const critThreshold = tn / critDivisor;
  const roll = await new Roll("1d100").roll();

  const resultLabel = getResultLabel({
    rollTotal: roll.total,
    tn,
    critThreshold,
    autoFailThreshold,
  });

  return {
    rolls: [roll],
    htmlParts: [
      `<p>${modifiedCheckName}</p>`,
      resultLabel,
      await roll.render(),
    ],
  };
}

// Returns result label and roll
async function oldSuccessRoll({
  tn = 1,
  critBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: OldSuccessRollData = {}): Promise<{ resultLabel: string; roll: Roll }> {
  const critDivisor = critBoost ? 5 : 10;
  const critThreshold = tn / critDivisor;

  const roll = await new Roll("1d100").roll();

  const resultLabel = getResultLabel({
    rollTotal: roll.total,
    tn,
    critThreshold,
    autoFailThreshold,
  });

  return { resultLabel, roll };
}

// For direct TN rolls off the sheet (e.g. Lu checks, Save checks)
export async function statRoll(
  actor: SmtActor,
  token: TokenDocument<SmtActor> | undefined,
  tnType: StatRollTNType,
  accuracyStat: CharacterStat,
  showDialog: boolean,
) {
  const data = actor.system;
  const baseTN = data.stats[accuracyStat][tnType];
  const autoFailThreshold = data.autoFailThreshold;
  // Straight stat rolls generally don't have a crit boost
  const hasCritBoost = false;

  // Label to show in dialog box e.g. "St"
  const checkLabel = game.i18n.localize(`SMT.${tnType}.${accuracyStat}`);
  const checkName = game.i18n.format("SMT.dice.statCheckLabel", {
    stat: checkLabel,
  });

  const { rolls, htmlParts } = await successRoll({
    checkName,
    hasCritBoost,
    baseTN,
    showDialog,
    autoFailThreshold,
  });

  const content = htmlParts.join("\n");

  const chatData = {
    user: game.user.id,
    content,
    speaker: {
      scene: game.scenes.current,
      token,
      actor,
    },
    rolls,
  };

  return await ChatMessage.create(chatData);
}

interface SkillRollData {
  skill?: SmtItem;
  showDialog?: boolean;
}

// TODO: Refactor to use the new successRoll
export async function skillRoll({
  skill,
  showDialog = false,
}: SkillRollData = {}) {
  const actor = skill?.parent;
  const actorData = actor?.system as SmtCharacterDataModel;
  const token = skill?.parent?.token;
  if (!skill) {
    return ui.notifications.error("Malformed data in skillRoll");
  }

  if (!actorData) {
    return ui.notifications.error("Missing actorData in skillRoll");
  }

  const skillName = skill.name;
  const skillData = skill.system;

  const baseTN = skillData.tn + skillData.tnMod;
  const hasCritBoost = skillData.hasCritBoost;
  const autoFailThreshold = skillData.autoFailThreshold;

  const baseRollName = game.i18n.format("SMT.dice.skillCheckLabel", {
    checkName: skillName,
    tn: `${baseTN}`,
  });

  const hint = game.i18n.localize("SMT.dice.modifierHint");

  const { mod, cancelled, critBoost } = showDialog
    ? await renderSuccessModDialog({
        checkName: baseRollName,
        hint,
        hasCritBoost,
      })
    : { mod: 0, cancelled: false, critBoost: hasCritBoost };

  if (cancelled) return;

  const tn = baseTN + (mod ?? 0);

  const checkName = game.i18n.format("SMT.dice.skillCheckLabel", {
    checkName: skillName,
    tn: `${tn}`,
  });

  const htmlParts = [`<p>${checkName}</p>`];

  const { resultLabel, roll } = await oldSuccessRoll({
    tn,
    critBoost,
    autoFailThreshold,
  });

  htmlParts.push(`<h3>${resultLabel}</h3>`, await roll.render());

  const content = htmlParts.join("\n");

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
