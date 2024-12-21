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

interface DodgeRollResultData extends RollResultData {
  dodged?: boolean;
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

function getResult({
  rollTotal = 100,
  tn = 1,
  critThreshold = 1,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: ResultLabelOptions = {}): DiceRollResult {
  if (rollTotal >= 100) {
    return "fumble";
  } else if (rollTotal >= autoFailThreshold) {
    return "autofail";
  } else if (rollTotal <= critThreshold) {
    return "crit";
  } else if (rollTotal <= tn) {
    return "success";
  }

  return "fail";
}

function getResultLabel(result: DiceRollResult, effectType: RollEffectType) {
  // const result = getResult({ rollTotal, tn, critThreshold, autoFailThreshold, effectType });

  let resultName: DiceRollResult | "dodge" | "critDodge" = result;

  if (effectType === "dodge") {
    if (result === "success" || result === "autoSuccess") {
      resultName = "dodge";
    } else if (result === "crit") {
      resultName = "critDodge";
    }
  }

  const resultHtml = [
    `<div>${game.i18n.localize(`SMT.diceResult.${resultName}`)}</div>`,
  ];

  if (result === "crit" || result === "fumble") {
    // Add an extra hint
    const hintLoc = `SMT.rollEffect.${effectType}.${result}`;
    resultHtml.push(`<div>${game.i18n.localize(hintLoc)}</div>`);
  }

  return resultHtml.join("\n");
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
  effectType?: RollEffectType;
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
  effectType = "hit",
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

  const critThreshold = getCritThreshold(tn, critBoost ?? false);
  const roll = await new Roll("1d100").roll();

  const resultLabel = getResultLabel(
    getResult({
      rollTotal: roll.total,
      tn,
      critThreshold,
      autoFailThreshold,
    }),
    effectType,
  );

  return {
    rolls: [roll],
    htmlParts: [
      `<p>${modifiedCheckName}</p>`,
      resultLabel,
      await roll.render(),
    ],
  };
}

interface PowerRollData {
  power?: number;
  powerBoost?: boolean;
  damageType?: DamageType;
  affinity?: Affinity;
  targeted?: boolean;
  targetName?: string;
  targetResist?: number;
  targetAffinityLevel?: AffinityLevel;
}

// TODO: Crits deal double damage and ignore resistance
async function basicPowerRoll({
  power = 0,
  powerBoost = false,
  damageType = "phys",
  affinity = "phys",
  targeted = false,
  targetName = "",
  targetResist = 0,
  targetAffinityLevel = "none",
}: PowerRollData = {}): Promise<RollResultData> {
  const rollString = `${powerBoost ? 2 : 1}d10x + ${power}`;

  const roll = await new Roll(rollString).roll();

  const htmlParts: string[] = [];
  if (!targeted) {
    const resultMsg = game.i18n.format("SMT.dice.powerChatCardMsg", {
      power: `${roll.total}`,
      affinity: game.i18n.localize(`SMT.affinities.${affinity}`),
      damageType,
    });

    htmlParts.push(`<p>${resultMsg}</p>`);
  } else {
    // Apply resist and affinity
    let damage = Math.max(roll.total - targetResist, 0);

    // If the target's affinity is normal, no need to do anything
    if (targetAffinityLevel !== "none") {
      const affinityMsg = game.i18n.localize(
        `SMT.resistChatResult.${targetAffinityLevel}`,
      );
      htmlParts.push(`<div>${affinityMsg}</div>`);

      if (targetAffinityLevel === "resist") {
        damage = Math.floor(damage / 2);
      }

      if (targetAffinityLevel === "weak") {
        damage = damage * 2;
      }
    }
    if (targetAffinityLevel !== "null") {
      const damageMsg = game.i18n.format("SMT.dice.damageCardMsg", {
        target: targetName,
        damage: `${damage}`,
        resist: `${targetResist}`,
        damageType: game.i18n.localize(`SMT.powerTypes.${damageType}`),
      });

      htmlParts.push(`<div>${damageMsg}</div>`);
    }
  }

  htmlParts.push(await roll.render());

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

interface DodgeRollData {
  characterName?: string;
  tn?: number;
  autoFailThreshold?: number;
}

// For internal dodges within skill rolls; may refactor later
export async function dodgeRoll({
  characterName = "",
  tn = 1,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: DodgeRollData = {}): Promise<DodgeRollResultData> {
  const checkLabel = game.i18n.format("SMT.dice.dodgeCheckLabel", {
    character: characterName,
    tn: `${tn}`,
  });
  const htmlParts = [`<div>${checkLabel}</div>`];

  const roll = await new Roll("1d100").roll();

  const critThreshold = getCritThreshold(tn, false);

  const result = getResult({
    rollTotal: roll.total,
    tn,
    critThreshold,
    autoFailThreshold,
  });

  // e.g. Dodged!
  const label = getResultLabel(result, "dodge");

  htmlParts.push(`<div>${label}</div>`, await roll.render());

  return {
    htmlParts,
    rolls: [roll],
    dodged:
      result === "success" || result === "autoSuccess" || result === "crit",
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

  if (skillData.hasAttack) {
    const power = skillData.power;
    const powerBoost = skillData.hasPowerBoost;
    const damageType = skillData.damageType;
    const affinity = skillData.affinity;
    const ailment: AilmentData = skillData.ailment as AilmentData;

    if (targets.length > 0) {
      // Make a dodge and power and ailment roll (if applicable) for each target
      for (const target of targets) {
        // Make a dodge roll
        const targetName = target.name;
        const targetData = target.actor.system;
        const dodgeTN = targetData.tn.dodge;

        const dodgeRollResult = await dodgeRoll({
          characterName: targetName,
          tn: dodgeTN,
          autoFailThreshold,
        });

        htmlParts.push(...dodgeRollResult.htmlParts);
        rolls.push(...dodgeRollResult.rolls);

        if (dodgeRollResult.dodged) break;

        // Make power and/or ailment rolls if applicable
        if (skillData.hasPowerRoll) {
          // Make a power roll
          const targetResist = targetData.resist[damageType];
          const targetAffinityLevel = targetData.affinities[affinity];

          const powerRollResult = await basicPowerRoll({
            power,
            powerBoost,
            damageType,
            affinity,
            targeted: true,
            targetName,
            targetResist,
            targetAffinityLevel,
          });

          htmlParts.push(...powerRollResult.htmlParts);
          rolls.push(...powerRollResult.rolls);
        }

        if (skillData.ailment.name !== "none") {
          // Make an ailment roll
        }
      }
    } else {
      if (skillData.hasPowerRoll) {
        // Roll a straight power roll
        const powerRollResult = await basicPowerRoll({
          power,
          powerBoost,
          damageType,
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

  // Add effect string to HTML, if any

  const actor = skill.system.parent?.parent as SmtActor;

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

function getCritThreshold(tn: number, critBoost: boolean) {
  const divisor = critBoost ? 5 : 10;
  return Math.max(Math.floor(tn / divisor), 1);
}