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

interface RollResultData {
  htmlParts: string[];
  rolls: Roll[];
}

interface AilmentData {
  name: Ailment;
  rate: number;
}

interface SkillRollData {
  skill?: SmtItem;
  targets?: Token<SmtActor>[];
  showDialog?: boolean;
}

interface PowerRollData {
  power?: number;
  powerBoost?: boolean;
  physMagCategory?: PhysMagCategory;
  affinity?: Affinity;
  showDialog?: boolean;
}

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
    const critHint = game.i18n.localize("SMT.dice.critHint");
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
  showDialog = false,
  baseTN = 1,
  hasCritBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: SuccessRollData = {}): Promise<RollResultData> {
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

async function basicPowerRoll({
  power = 0,
  powerBoost = false,
  physMagCategory = "phys",
  affinity = "phys",
}: PowerRollData = {}) {
  const rollString = `${powerBoost ? 2 : 1}d10x + ${power}`;

  const roll = await new Roll(rollString).roll();

  const resultMsg = game.i18n.format("SMT.dice.powerChatCardMsg", {
    power: `${roll.total}`,
    affinity,
    physMagCategory,
  });

  const htmlParts = [`<p>${resultMsg}</p>`, await roll.render()];

  return {
    htmlParts,
    rolls: [roll],
  };
}

interface AilmentRollData {
  name?: string;
  rate?: number;
}

// Poison: {rollTotal} vs. {tn}%
// Inflicted Poison!
export async function ailmentRoll({
  name = "none",
  rate = 0,
}: AilmentRollData = {}): Promise<RollResultData> {
  const ailmentLabel = game.i18n.localize(`SMT.ailments.${name}`);
  const roll = await new Roll("1d100").roll();
  const rollMsg = game.i18n.format("SMT.dice.ailmentRollMsg", {
    name: ailmentLabel,
    rollTotal: `${roll.total}`,
    rate: `${rate}`,
  });

  const htmlParts = [`<p>${rollMsg}</p>`, await roll.render()];

  return {
    htmlParts,
    rolls: [roll],
  };
}

export async function skillRoll({
  skill,
  targets = [],
  showDialog = false,
}: SkillRollData = {}) {
  if (!skill) return;

  const skillData = skill.system;
  const checkName = skill.name;
  const baseTN = skillData.tn + skillData.tnMod;
  const hasCritBoost = skillData.hasCritBoost;
  const autoFailThreshold = skillData.autoFailThreshold;

  const htmlParts: string[] = [];
  const rolls: Roll[] = [];

  const successRollResult = await successRoll({
    checkName,
    hasCritBoost,
    baseTN,
    autoFailThreshold,
    showDialog,
  });

  htmlParts.push(...successRollResult.htmlParts);
  rolls.push(...successRollResult.rolls);

  if (skillData.isAttack) {
    const power = skillData.power;
    const powerBoost = skillData.hasPowerBoost;
    const physMagCategory = skillData.physMagCategory;
    const affinity = skillData.affinity;
    const ailment: AilmentData = skillData.ailment as AilmentData;

    if (targets.length > 0) {
      // Roll dodge against each target, then power + ailment against failed dodges
    } else {
      if (!skillData.ailmentOnly) {
        // Roll a straight power roll
        const powerRollResult = await basicPowerRoll({
          power,
          powerBoost,
          physMagCategory,
          affinity,
        });

        htmlParts.push(...powerRollResult.htmlParts);
        rolls.push(...powerRollResult.rolls);
      }

      if (ailment.name !== "none") {
        const ailmentRollResult = await ailmentRoll({
          name: ailment.name,
          rate: ailment.rate,
        });

        htmlParts.push(...ailmentRollResult.htmlParts);
        rolls.push(...ailmentRollResult.rolls);
      }
    }
  }

  // If there's an ailment roll, make it

  const actor = skill.system.actor;

  const token = actor.token;

  const content = htmlParts.join("\n");

  const chatData = {
    user: game.user.id,
    content,
    speaker: {
      scene: game.scenes.current,
      actor,
      token,
    },
    rolls,
  };

  return await ChatMessage.create(chatData);
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
