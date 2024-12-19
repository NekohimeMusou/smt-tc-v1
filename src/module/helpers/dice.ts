import { SmtActor } from "../documents/actor/actor.js";

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

async function successModDialog(
  checkLabel: string,
  hint = "",
  hasCritBoost = false,
): Promise<ModDialogResult> {
  const template =
    "systems/smt-tc/templates/dialog/success-modifier-dialog.hbs";
  const content = await renderTemplate(template, {
    checkLabel,
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

interface SuccessRollData {
  checkName?: string;
  tn?: number;
  critBoost?: boolean;
  autoFailThreshold?: number;
}

// Returns result label and roll
async function successRoll({
  tn = 1,
  critBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: SuccessRollData = {}): Promise<{ resultLabel: string; roll: Roll }> {
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
  hasCritBoost = false,
) {
  const data = actor.system;
  const baseTn = data.stats[accuracyStat][tnType];
  const autoFailThreshold = data.autoFailThreshold;

  // Label to show in dialog box
  const checkName = game.i18n.localize(`SMT.${tnType}.${accuracyStat}`);
  const checkLabel = game.i18n.format("SMT.dice.statCheckMsg", {
    checkName,
    tn: `${baseTn}`,
  });

  const hint = game.i18n.localize("SMT.dice.modifierHint");

  const { mod, cancelled, critBoost } = showDialog
    ? await successModDialog(checkLabel, hint, hasCritBoost)
    : { mod: 0, cancelled: false, critBoost: hasCritBoost };

  if (cancelled) return;

  const tn = baseTn + (mod ?? 0);

  // e.g. "St Check: TN 38%""
  const rollName = game.i18n.format("SMT.dice.statCheckMsg", {
    checkName,
    tn: `${tn}`,
  });

  const htmlParts = [`<p>${rollName}</p>`];

  const { resultLabel, roll } = await successRoll({
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
