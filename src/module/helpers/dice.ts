import { SmtActor } from "../documents/actor/actor.js";
import { SmtItem } from "../documents/item/item.js";
import { renderSuccessCheckDialog } from "./dialog.js";

declare global {
  type SuccessLevel = "fumble" | "fail" | "success" | "crit" | "autofail";
}

interface CheckOptions {
  skill?: SmtItem;
  actor?: SmtActor;
  token?: TokenDocument<SmtActor>;
  accuracyStat?: CharacterStat;
  showDialog?: boolean;
  tnType?: SuccessRollCategory;
  tnMod?: number;
  autoFailThreshold?: number;
  focused?: boolean;
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

interface TargetData {
  actor?: SmtActor;
  token?: Token<SmtActor>;
  target?: Token<SmtActor>;
  totalPower?: number;
  criticalHit?: boolean;
  ailment?: AilmentData;
  skipDodgeRoll?: boolean;
  damageType?: DamageType;
  hasDamage?: boolean;
  affinity?: Affinity;
  healing?: boolean;
  attackerName?: string;
}

interface AilmentCheckData {
  ailmentInflicted: boolean;
  roll: Roll;
}

// This rolls the check(s) and displays the chat card(s) at the end
// (maybe the success one separately)
export async function rollCheck({
  skill,
  actor,
  token,
  accuracyStat,
  tnType,
  tnMod = 0,
  showDialog = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
  focused = false,
}: CheckOptions = {}) {
  // Get necessary data for an accuracy roll
  let checkName: string;
  let baseTN = 1;
  let auto = false;

  if (actor && tnType && accuracyStat) {
    const statLabel = game.i18n.localize(`SMT.${tnType}.${accuracyStat}`);
    baseTN = actor.system.stats[accuracyStat][tnType];
    checkName = game.i18n.format("SMT.dice.statCheckLabel", {
      stat: statLabel,
    });
  } else if (skill) {
    auto = skill.system.accuracyStat === "auto";
    baseTN = skill.system.tn + skill.system.tnMod;
    checkName = skill.name;
  } else {
    throw new TypeError("Malformed dice roll data");
  }

  const successCardHtml: string[] = [];
  const successCardRolls: Roll[] = [];
  let successLevel: SuccessLevel = "fail";

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

    // TODO: Fix to account for Might skill
    const critBoost = skill?.system.hasCritBoost ?? false;
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
  const success = criticalHit || successLevel === "success" || auto;
  let totalPower = 0;

  if (success && skill?.system.hasPowerRoll) {
    // Find the total power, if the skill has an attack, and push HTML + roll
    const power = skill.system.power;
    const powerBoost = skill.system.hasPowerBoost;

    const powerRollResult = await powerRoll(power, powerBoost);
    totalPower = powerRollResult.totalPower;

    if (criticalHit) {
      totalPower *= 2;
    }

    if (focused && skill.system.damageType === "phys") {
      totalPower *= 2;
    }

    const totalPowerMsg = game.i18n.format("SMT.dice.totalPower", {
      power: `${totalPower}`,
    });

    successCardHtml.push(
      `<div>${totalPowerMsg}</div>`,
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
        skill.system.ailment.rate,
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

  if (skill?.system.effect) {
    successCardHtml.push(`<div>${skill.system.effect}</div>`);
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
  if (success && targets.size > 0 && skill) {
    for (const target of targets) {
      await processTarget({
        target,
        totalPower,
        criticalHit,
        ailment: skill.system.ailment,
        skipDodgeRoll: ["healing", "support", "unique"].includes(
          skill.system.affinity,
        ),
      });
    }
  }
}

// Directly generate HTML strings in here
async function processTarget({
  actor,
  token,
  target,
  totalPower = 0,
  criticalHit = false,
  ailment = { name: "none", rate: 0 },
  affinity = "phys",
  skipDodgeRoll = false,
  damageType = "phys",
  healing = false,
  attackerName = "Someone",
}: TargetData = {}) {
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

  const targetAffinity = targetData.affinities[affinity];

  if (
    !skipDodgeRoll &&
    !(targetAffinity === "reflect" || targetAffinity === "drain")
  ) {
    const autoFailThreshold = targetData.autoFailThreshold;

    const successData = await successCheck({
      tn: dodgeTN,
      autoFailThreshold,
    });

    const dodgeRoll = successData.roll;
    dodgeSuccess = successData.successLevel;
    rolls.push(dodgeRoll);

    // PUSH HTML CONTENT
    // e.g. Target dodged! TN: XX%
    htmlParts.push(
      `<div>${game.i18n.format(`SMT.dice.dodge.${dodgeSuccess}`, { targetName, tn: `${dodgeTN}` })}</div>`,
      await dodgeRoll.render(),
    );
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
    } else if (!healing) {
      // PUSH HTML CONTENT
      // "Critical hit downgraded!"
      htmlParts.push(
        `<div>${game.i18n.localize("SMT.dice.critDowngrade")}</div>`,
      );
    }
  }

  const dodged =
    dodgeSuccess === "crit" || (dodgeSuccess === "success" && !criticalHit);

  const ignoreResist =
    (criticalHit && !dodged && dodgeSuccess !== "success") || healing;

  // e.g. REFLECT!
  if (targetAffinity !== "none") {
    const affinityResult = game.i18n.localize(
      `SMT.affinityResult.${targetAffinity}`,
    );

    htmlParts.push(`<div>${affinityResult}</div>`);
  }

  if (targetAffinity === "null") {
    power = 0;
  }

  if (targetAffinity === "weak") {
    power *= 2;
  }

  const targetResist = ignoreResist ? 0 : targetData.resist[damageType];

  power -= targetResist;

  const powerTag = healing || targetAffinity === "drain" ? "healing" : "damage";
  const finalTarget =
    targetAffinity === "reflect" || dodgeSuccess === "fumble"
      ? attackerName
      : targetName;
  const affinityString = game.i18n.localize(`SMT.affinities.${affinity}`);

  if (power > 0 && !dodged) {
    // e.g. "TargetName takes 20 Phys damage! (Phys resist: 12)"
    const powerMsg = game.i18n.format(`SMT.dice.powerMsg.${powerTag}`, {
      target: finalTarget,
      damage: `${power}`,
      affinity: affinityString,
      damageType: game.i18n.localize(`SMT.damageTypes.${damageType}`),
      resist: `${targetResist}`,
    });

    // PUSH HTML CONTENT
    htmlParts.push(`<div>${powerMsg}</div`);
  }

  // Make an ailment roll if there is one
  if (ailment.name !== "none") {
    const ailmentAffinity = targetData.affinities.ailment;
    const nullifyingAffinities: AffinityLevel[] = ["drain", "null", "reflect"];
    const nullify =
      nullifyingAffinities.includes(ailmentAffinity) ||
      nullifyingAffinities.includes(targetAffinity);

    if (nullify) {
      // PUSH HTML CONTENT
      // "Ailment nullified!"
      htmlParts.push(
        // "Ailment nullified!"
        `<div>${game.i18n.localize("SMT.dice.ailmentNullified")}</div>`,
      );
    } else {
      let ailmentRate = ailment.rate;

      if (ailmentAffinity === "resist") {
        ailmentRate = Math.floor(ailmentRate / 2);
      } else if (ailmentAffinity === "weak") {
        ailmentRate *= 2;
      }

      if (targetAffinity === "resist") {
        ailmentRate = Math.floor(ailmentRate / 2);
      } else if (targetAffinity === "weak") {
        ailmentRate *= 2;
      }

      const { ailmentInflicted, roll } = await ailmentCheck(ailmentRate);
      rolls.push(roll);

      const ailmentName = game.i18n.localize(`SMT.ailments.${ailment.name}`);

      const ailmentTag = ailmentInflicted ? "hit" : "miss";

      const ailmentMsg = game.i18n.format(`SMT.dice.ailment.${ailmentTag}`, {
        ailmentName,
        target: targetName,
      });

      // PUSH HTML CONTENT
      // e.g. "TargetName avoided Freeze!" "TargetName is inflicted with Freeze!"
      htmlParts.push(`<div>${ailmentMsg}</div>`);
    }
  }

  if (htmlParts.length > 0) {
    const chatData = {
      user: game.user.id,
      content: htmlParts.join("\n"),
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

async function ailmentCheck(rate: number): Promise<AilmentCheckData> {
  const { successLevel, roll } = await successCheck({
    tn: Math.max(rate, 5),
    autoFailThreshold: 96,
  });

  const ailmentInflicted =
    successLevel === "crit" || successLevel === "success";

  return { ailmentInflicted, roll };
}
