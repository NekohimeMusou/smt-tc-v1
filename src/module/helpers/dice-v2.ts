import { SmtActor } from "../documents/actor/actor.js";
import { SmtItem } from "../documents/item/item.js";
import { renderSuccessCheckDialog } from "./dialog.js";

declare global {
  type SuccessLevel = "fumble" | "fail" | "success" | "crit" | "autofail";
}

interface CheckOptions {
  skill?: SmtItem;
  actor?: SmtActor;
  token?: Token<SmtActor>;
  accuracyStat?: AccuracyStat;
  showDialog?: boolean;
  tnType?: SuccessRollCategory;
  tnMod?: number;
  critBoost?: boolean;
  autoFailThreshold?: number;
}

interface AilmentData {
  name: Ailment;
  rate: number;
}

interface SuccessCheckOptions {
  tn?: number;
  critBoost?: boolean;
  autoFailThreshold?: number;
}

interface PowerCheckResult {
  totalPower: number;
  roll: Roll;
}

interface SuccessCheckResult {
  successLevel: SuccessLevel;
  roll: Roll;
}

// This rolls the check(s) and displays the chat card(s) at the end
// (maybe the success one separately)
export async function rollCheck({
  skill,
  actor,
  token,
  accuracyStat = "auto",
  tnType = "tn",
  tnMod = 0,
  showDialog = false,
  critBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: CheckOptions = {}) {
  const auto = accuracyStat === "auto";

  // Get necessary data for an accuracy roll
  let checkName: string;
  let baseTN = 1;
  if (actor && !auto) {
    const statLabel = game.i18n.localize(`SMT.tn.${accuracyStat}`);
    baseTN = actor.system.stats[accuracyStat][tnType];
    checkName = game.i18n.format("SMT.dice.statCheckLabel", {
      stat: statLabel,
    });
  } else if (skill) {
    baseTN = skill.system.tn + skill.system.tnMod;
    checkName = skill.name;
  } else {
    throw new TypeError("Malformed dice roll data");
  }

  const successCardHtml: string[] = [];
  const successCardRolls: Roll[] = [];
  let successLevel: SuccessLevel = "success";

  if (auto) {
    successCardHtml.push(
      `<div>${game.i18n.format("SMT.dice.autoCheckLabel", { checkName })}</div>`,
    );
  } else {
    // Show the modifier dialog, if applicable
    const dialogTitle = game.i18n.format("SMT.dice.skillCheckTitle", {
      checkName,
      tn: `${baseTN}`,
    });

    const { mod, cancelled } = showDialog
      ? await renderSuccessCheckDialog({
          checkName: dialogTitle,
          hint: game.i18n.localize("SMT.dice.modifierHint"),
        })
      : { mod: 0 };

    if (cancelled) return;

    // NOW make the success roll
    const tn = baseTN + tnMod + (mod ?? 0);

    const modifiedCheckTitle = game.i18n.format("SMT.dice.skillCheckTitle", {
      checkName,
      tn: `${tn}`,
    });

    // Push the check title (e.g. "Strength Check: TN XX%")
    successCardHtml.push(`<div>${modifiedCheckTitle}</div>`);

    const successCheckResult = await successCheck({
      tn,
      critBoost,
      autoFailThreshold,
    });

    successLevel = successCheckResult.successLevel;

    // Push the result (e.g. "Success!" "Failed!")
    const rollResultLabel = game.i18n.localize(
      `SMT.diceResult.${successLevel}`,
    );
    successCardRolls.push(successCheckResult.roll);
    successCardHtml.push(
      `<div>${rollResultLabel}</div>`,
      await successCheckResult.roll.render(),
    );
  }

  const criticalHit = successLevel === "crit";
  const success = criticalHit || successLevel === "success";
  let totalPower = 0;

  if (success && skill?.system.hasPowerRoll) {
    // Find the total power, if the skill has an attack, and push HTML + roll
    const power = skill.system.power;
    const powerBoost = skill.system.hasPowerBoost;

    const powerRollResult = await powerRoll(power, powerBoost);
    totalPower = powerRollResult.totalPower * (criticalHit ? 2 : 1);

    const powerMsg = game.i18n.format("SMT.dice.totalPower", {
      power: `${totalPower}`,
    });

    successCardHtml.push(
      `<div>${powerMsg}</div>`,
      await powerRollResult.roll.render(),
    );
    successCardRolls.push(powerRollResult.roll);
  }

  // If there's no target roll one ailment chance and add it to the card
  // Otherwise wait to do it with each target
  const targets = game.user.targets as Set<Token<SmtActor>>;

  if (targets.size < 1 && skill) {
    const { name: ailmentName, rate: ailmentRate } = skill.system.ailment;

    if (ailmentName !== "none" && ailmentRate > 0) {
      // Generate the label for ailment chance
      const ailmentNameLabel = game.i18n.localize(
        `SMT.ailments.${ailmentName}`,
      );

      const checkTitle = game.i18n.format("SMT.dice.ailmentCheckTitle", {
        ailmentNameLabel,
        ailmentRate: `${ailmentRate}`,
      });

      successCardHtml.push(`<div>${checkTitle}</div>`);

      const { ailmentInflicted, roll: ailmentRoll } = await ailmentCheck(
        skill.system.ailment,
      );

      if (ailmentInflicted) {
        successCardHtml.push(
          `<div>${game.i18n.format("SMT.dice.ailmentRollHit", { target: "Someone", ailmentNameLabel })}</div>`,
          await ailmentRoll.render(),
        );

        successCardRolls.push(ailmentRoll);
      }
    }
  }

  // Spit out a chat card here to break up the output a bit
  const successChatData = {
    user: game.user.id,
    content: successCardHtml.join("\n"),
    speaker: {
      scene: game.scenes.current,
      actor,
      token,
    },
    rolls: successCardRolls,
  };

  await ChatMessage.create(successChatData);

  // Process each target and apply damage and ailment (if any)
  if (targets.size > 0 && skill) {
    for (const target of targets) {
      const { htmlStrings, rolls } = await processTarget({
        target,
        totalPower,
        criticalHit,
        ailment: skill.system.ailment,
        skipDodgeRoll: ["healing", "support", "unique"].includes(
          skill.system.affinity,
        ),
      });

      const targetCardHtml = htmlStrings.join("\n");

      const chatData = {
        user: game.user.id,
        content: targetCardHtml,
        speaker: {
          scene: game.scenes.current,
          actor,
          token,
        },
        rolls,
      };

      await ChatMessage.create(chatData);
    }
  }
}

interface TargetData {
  target?: Token<SmtActor>;
  totalPower?: number;
  criticalHit?: boolean;
  ailment?: AilmentData;
  skipDodgeRoll?: boolean;
  damageType?: DamageType;
  hasDamage?: boolean;
  affinity?: Affinity;
  healing?: boolean;
}

interface TargetProcessResult {
  htmlStrings: string[];
  rolls: Roll[];
}

// Directly generate HTML strings in here
async function processTarget({
  target,
  totalPower = 0,
  criticalHit = false,
  ailment = { name: "none", rate: 0 },
  skipDodgeRoll = false,
  damageType = "phys",
  healing = false,
}: TargetData = {}): Promise<TargetProcessResult> {
  if (!target) {
    throw new TypeError("Can't process a target with no target");
  }

  let power = totalPower;

  const htmlParts: string[] = [];
  const rolls: Roll[] = [];

  // Make a dodge roll, unless it's a healing or support skill
  const targetName = target.name;
  const targetData = target.actor.system;

  let dodgeSuccess: SuccessLevel = "fail";
  const dodgeTN = targetData.tn.dodge;

  if (!skipDodgeRoll) {
    const autoFailThreshold = targetData.autoFailThreshold;

    const dodgeCheckLabel = game.i18n.format("SMT.dice.", {
      targetName,
      tn: `${dodgeTN}`,
    });

    htmlParts.push(`<div>${dodgeCheckLabel}</div>`);

    const successData = await successCheck({
      tn: dodgeTN,
      autoFailThreshold,
    });

    dodgeSuccess = successData.successLevel;
    rolls.push(successData.roll);
  }

  // If it's a critical hit, a successful dodge downgrades to normal
  // And a critical dodge evades it
  if (criticalHit) {
    if (dodgeSuccess === "crit") {
      power = 0;
    } else if (dodgeSuccess === "fumble") {
      power *= 4;
    } else if (dodgeSuccess === "fail" || dodgeSuccess === "autofail") {
      power *= 2;
    }
  }

  const dodged =
    dodgeSuccess === "crit" || (dodgeSuccess === "success" && !criticalHit);

  const dodgeMsg = dodged ? "dodgeSuccess" : "dodgeFail";

  htmlParts.push(
    `<div>${game.i18n.format(`SMT.dice.${dodgeMsg}`, { targetName, tn: `${dodgeTN}` })}</div>`,
  );

  const ignoreResist =
    (criticalHit && !dodged && dodgeSuccess !== "success") || healing;

  // TODO: Do affinity before resist

  // IF unsuccessful, calculate damage and make an ailment roll (if applicable)
  const targetResist = ignoreResist ? 0 : targetData.resist[damageType];

  const damageTotal = power - targetResist;
}

async function powerRoll(
  power: number,
  powerBoost: boolean,
): Promise<PowerCheckResult> {
  const numDice = powerBoost ? "2" : "1";

  const roll = await new Roll(`${numDice}d10x + ${power}`).roll();

  return { totalPower: roll.total, roll };
}

async function successCheck({
  tn = 1,
  critBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: SuccessCheckOptions = {}): Promise<SuccessCheckResult> {
  const critThreshold = Math.max(Math.floor(tn / (critBoost ? 5 : 10)), 1);

  const roll = await new Roll("1d100").roll();

  const total = roll.total;

  let successLevel: SuccessLevel = "fail";

  if (total >= 100) {
    successLevel = "fumble";
  } else if (total >= autoFailThreshold && total <= tn) {
    successLevel = "autofail";
  } else if (total <= critThreshold) {
    successLevel = "crit";
  } else if (total <= tn) {
    successLevel = "success";
  }

  return { successLevel, roll };
}

interface AilmentCheckData {
  ailmentInflicted: boolean;
  roll: Roll;
}

async function ailmentCheck(
  ailment: AilmentData = { name: "none", rate: 0 },
): Promise<AilmentCheckData> {
  const { rate: ailmentRate } = ailment;

  const { successLevel, roll } = await successCheck({
    tn: Math.max(ailmentRate, 5),
    autoFailThreshold: 96,
  });

  const ailmentInflicted =
    successLevel === "crit" || successLevel === "success";

  return { ailmentInflicted, roll };
}
