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
  pinhole?: boolean;
  attackerName?: string;
}

interface AilmentCheckData {
  ailmentInflicted: boolean;
  roll: Roll;
}

function getBaseTN(
  actor: SmtActor,
  stat: CharacterStat,
  tnType: "tn" | "derivedTN",
) {
  const tnName =
    tnType === "derivedTN" ? CONFIG.SMT.derivedTNStats[stat] : stat;

  return actor.system.tn[tnName];
}

// This rolls the check(s) and displays the chat card(s) at the end
// (maybe the success one separately)
// This needs to be refactored to use a handlebars template REAL bad
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
  let checkName = "";
  let baseTN = 1;
  let auto = false;

  if (!actor) {
    throw new TypeError("No actor in roll data!");
  }

  if (tnType && accuracyStat) {
    const statLabel = game.i18n.localize(`SMT.${tnType}.${accuracyStat}`);
    baseTN = getBaseTN(actor, accuracyStat, tnType);
    checkName = game.i18n.format("SMT.dice.statCheckLabel", {
      stat: statLabel,
    });
  } else if (skill) {
    auto = skill.system.accuracyStat === "auto";
    baseTN = skill.system.tn;
    checkName = skill.name;
  } else {
    throw new TypeError("Malformed TN check data!");
  }

  if (skill?.system.skillType === "other") {
    await skill.update({ "system.expended": true });
  }

  const skillType = skill?.system.skillType;

  if (actor.system.mute && (skillType === "mag" || skillType === "spell")) {
    ui.notifications.notify(game.i18n.localize("SMT.ailmentMsg.mute"));
    return;
  }

  const htmlParts: string[] = [];
  const rolls: Roll[] = [];

  // Let them make saving throws if they can't take actions
  if (
    (actor.system.noActions &&
      !(tnType === "derivedTN" && accuracyStat === "vi")) ||
    actor.statuses.has("dead")
  ) {
    ui.notifications.notify(game.i18n.localize("SMT.ailmentMsg.noActions"));
    return;
  } else if (actor.system.panic) {
    const { html, rolls: panicRolls } = await panicRoll(actor.name);

    htmlParts.push(html);
    rolls.push(...panicRolls);
  }

  const cost = skill?.system.cost ?? 0;
  const costType = skill?.system.costType;

  if (cost > 0 && costType) {
    // TODO: Make this output a card, for when enemies randomly do useless things
    // Return if insufficient HP/MP

    if (actor.system[costType].value < cost) {
      ui.notifications.warn(
        game.i18n.format("SMT.error.insufficientResource", {
          resource: game.i18n.localize(`SMT.resources.${costType}`),
        }),
      );

      return;
    }

    // There's gotta be a better way to do this
    switch (costType) {
      case "hp":
        await actor.update({
          "system.hp.value": actor.system.hp.value - cost,
        });
        break;
      case "mp":
        await actor.update({
          "system.mp.value": actor.system.mp.value - cost,
        });
        break;
    }
  }

  // Don't drop TN boosts if it's an auto skill
  if (!auto) {
    await actor.update({ "system.tnBoosts": 0 });
  }

  // Unfocus
  await actor.effects
    .find((e) => e.name === game.i18n.localize("SMT.characterMods.focused"))
    ?.delete();

  let successLevel: SuccessLevel = "fail";

  // Repeating myself more and more here, need to refactor this
  if (auto) {
    htmlParts.push(
      `<h3>${game.i18n.format("SMT.dice.autoCheckLabel", { checkName })}</h3>`,
    );

    if (cost > 0 && costType) {
      htmlParts.push(
        `<h4>${game.i18n.format("SMT.dice.skillCost", { cost: `${cost}`, resource: costType.toLocaleUpperCase() })}</h4>`,
      );
    }

    // Add message if poisoned
    if (actor.system.poison) {
      const { html, roll } = await poisonRoll();

      rolls.push(roll);
      htmlParts.push(html);
    }

    // Add skill effect
    if (skill?.system.effect) {
      htmlParts.push(`<div>${skill.system.effect}</div>`);
    }
  } else {
    const multi = actor.system.multi ?? 1;
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
    const tn = Math.floor((baseTN + tnMod + (mod ?? 0)) / multi);

    const modifiedCheckTitle = game.i18n.format("SMT.dice.skillCheckTitle", {
      checkName,
      tn: `${tn}`,
    });

    // Push the check title (e.g. "Strength Check: TN XX%")
    htmlParts.push(`<h3>${modifiedCheckTitle}</h3>`);

    if (cost > 0 && costType) {
      htmlParts.push(
        `<h4>${game.i18n.format("SMT.dice.skillCost", { cost: `${cost}`, resource: costType.toLocaleUpperCase() })}</h4>`,
      );
    }

    // Push a message if you're poisoned
    if (actor.system.poison) {
      const { html, roll } = await poisonRoll();

      rolls.push(roll);
      htmlParts.push(html);
    }

    // Add skill effect
    if (skill?.system.effect) {
      htmlParts.push(`<div>${skill.system.effect}</div>`);
    }

    const critBoost =
      (skill?.system.critBoost ?? false) ||
      (skill?.system.damageType === "phys" && actor?.system.might);
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
    rolls.push(successCheckResult.roll);
    htmlParts.push(
      `<h3>${rollResultLabel}</h3>`,
      await successCheckResult.roll.render(),
    );
  }

  const rolledCriticalHit = successLevel === "crit";
  const success = rolledCriticalHit || successLevel === "success" || auto;
  const fumble = successLevel === "fumble";
  let totalPower = 0;

  if ((success || fumble) && skill?.system.hasPowerRoll) {
    // Find the total power, if the skill has an attack, and push HTML + roll
    const power = skill.system.power;
    const powerBoost =
      actor.system.powerBoost[skill.system.powerBoostType] ?? false;

    const powerRollResult = await powerRoll(power, powerBoost);
    totalPower = powerRollResult.totalPower;

    if (rolledCriticalHit) {
      totalPower *= 2;
    }

    if (focused && skill.system.damageType === "phys") {
      totalPower *= 2;
    }

    if (
      actor &&
      Object.keys(actor.system.elementBoosts).includes(skill.system.affinity)
    ) {
      const affinity = skill.system
        .affinity as keyof typeof actor.system.elementBoosts;
      const boost = actor.system.elementBoosts[affinity];
      totalPower = Math.floor((boost ? 1.5 : 1) * totalPower);
    }

    const totalPowerMsg = game.i18n.format("SMT.dice.totalPower", {
      power: `${totalPower}`,
    });

    htmlParts.push(
      `<h3>${totalPowerMsg}</h3>`,
      await powerRollResult.roll.render(),
    );
    rolls.push(powerRollResult.roll);
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

      htmlParts.push(`<div>${checkTitle}</div>`);

      const { ailmentInflicted, roll: ailmentRoll } = await ailmentCheck(
        skill.system.ailment.rate,
      );

      if (ailmentInflicted) {
        htmlParts.push(
          `<div>${game.i18n.format("SMT.dice.ailmentRollHit", { target: "Someone", ailmentNameLabel })}</div>`,
          await ailmentRoll.render(),
        );

        rolls.push(ailmentRoll);
      }
    }
  }

  if (actor.system.curse) {
    const curseRoll = await new Roll("1d100").roll();
    rolls.push(curseRoll);
    if (curseRoll.total <= 30) {
      htmlParts.push(`<h3>${game.i18n.localize("SMT.ailmentMsg.cursed")}</h3>`);
    }
  }

  // Half damage if attacker is poisoned
  if (actor.system.poison) {
    totalPower = Math.floor(totalPower / 2);
  }

  // Spit out a chat card here to break up the output a bit
  const successChatData = {
    user: game.user.id,
    content: htmlParts.join("\n"),
    speaker: {
      scene: game.scenes.current,
      actor,
      token,
    },
    rolls,
  };

  await ChatMessage.create(successChatData);

  // Process each target and apply damage and ailment (if any)
  if (success && targets.size > 0 && skill) {
    for (const target of targets) {
      const targetData = target.actor.system;

      const skipDodgeRoll =
        ["healing", "support", "unique"].includes(skill.system.affinity) ||
        targetData.noActions;

      const affinity = skill.system.affinity;

      const criticalHit =
        rolledCriticalHit ||
        (affinity === "phys" && targetData.physAttacksCrit);

      // Double the total power if this was turned into a critical by an ailment
      if (criticalHit && !rolledCriticalHit) {
        totalPower *= 2;
      }

      await processTarget({
        target,
        totalPower,
        criticalHit,
        ailment: skill.system.ailment,
        affinity,
        skipDodgeRoll,
        damageType: skill.system.damageType,
        healing: skill.system.affinity === "healing",
        pinhole: skill.system.pinhole,
        attackerName: actor?.name ?? "Someone",
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
  pinhole = false,
  attackerName = "Someone",
}: TargetData = {}) {
  if (!target) {
    throw new TypeError("Can't process a target with no target");
  }

  let power = totalPower;

  // Make a dodge roll, unless it's a healing or support skill
  const targetName = target.name;
  const targetData = target.actor.system;

  const htmlParts: string[] = [`<h3>${targetName}</h3>`];
  const rolls: Roll[] = [];

  let dodgeSuccess: SuccessLevel = "fail";
  const dodgeTN = pinhole
    ? Math.floor(targetData.tn.dodge / 2)
    : targetData.tn.dodge;

  // If the target is frozen, ignore physical defense affinities
  const targetAffinity =
    affinity === "phys" &&
    targetData.affinities.phys !== "weak" &&
    targetData.ignorePhysAffinity
      ? "none"
      : targetData.affinities[affinity];

  if (
    !skipDodgeRoll &&
    !(
      targetAffinity === "reflect" ||
      targetAffinity === "drain" ||
      targetAffinity === "null"
    )
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
      `<div>${game.i18n.format("SMT.dice.skillCheckTitle", { checkName: "Dodge", tn: `${dodgeTN}` })}</div>`,
      `<h3>${game.i18n.localize(`SMT.diceResult.${dodgeSuccess}`)}</h3>`,
      await dodgeRoll.render(),
    );
  }

  // If it's a critical hit, a successful dodge downgrades to normal
  // And a critical dodge evades it
  if (criticalHit) {
    if (dodgeSuccess === "crit") {
      power = 0;
    } else if (dodgeSuccess === "success" && !healing) {
      // PUSH HTML CONTENT
      // "Critical hit downgraded!"
      htmlParts.push(
        `<div>${game.i18n.localize("SMT.dice.critDowngrade")}</div>`,
      );
      power = Math.floor(power / 2);
    }
  }

  if (dodgeSuccess === "fumble") {
    power *= 2;
  }

  const dodged =
    dodgeSuccess === "crit" || (dodgeSuccess === "success" && !criticalHit);

  const ignoreResist = (criticalHit && !dodged) || healing;

  // e.g. REFLECT!
  if (targetAffinity !== "none" && !dodged) {
    const affinityResult = game.i18n.localize(
      `SMT.affinityResult.${targetAffinity}`,
    );

    htmlParts.push(`<h3>${affinityResult}</h3>`);
  }

  if (targetAffinity === "null") {
    power = 0;
  }

  if (targetAffinity === "weak") {
    power *= 2;
  }

  if (targetAffinity === "resist") {
    power = Math.floor(power / 2);
  }

  const targetResist = ignoreResist ? 0 : targetData.resist[damageType];

  power -= pinhole ? Math.floor(targetResist / 2) : targetResist;

  const powerTag = healing || targetAffinity === "drain" ? "healing" : "damage";
  const finalTarget = targetAffinity === "reflect" ? attackerName : targetName;
  const affinityString = game.i18n.localize(`SMT.affinities.${affinity}`);

  // This is implied to happen after resists
  if (targetData.takeDoubleDamage) {
    power *= 2;
  }

  // If stoned and incoming damage isn't phys, force, or almighty, halve it
  if (!["phys", "force", "almighty"].includes(affinity) && targetData.stone) {
    power = Math.floor(power / 2);
  }

  if (power > 0 && !dodged) {
    // e.g. "TargetName takes 20 Phys damage! (Phys resist: 12)"
    const powerMsg = game.i18n.format(`SMT.dice.powerMsg.${powerTag}`, {
      target: finalTarget,
      damage: `${power}`,
      affinity: affinityString,
    });

    const resistMsg = game.i18n.format("SMT.dice.resistMsg", {
      damageType: game.i18n.localize(`SMT.damageTypes.${damageType}`),
      resist: `${targetResist}`,
    });

    // PUSH HTML CONTENT
    htmlParts.push(`<h3>${powerMsg}</h3>`, `<div>${resistMsg}</div>`);
  }

  // Make an ailment roll if there is one
  if (ailment.name !== "none") {
    const ailmentAffinity = targetData.affinities.ailment;
    const nullifyingAffinities: AffinityLevel[] = ["drain", "null", "reflect"];
    const nullify =
      nullifyingAffinities.includes(ailmentAffinity) ||
      nullifyingAffinities.includes(targetAffinity);

    if (!dodged) {
      if (nullify) {
        // PUSH HTML CONTENT
        // "Ailment nullified!"
        const ailmentLabel = game.i18n.localize(`SMT.ailments.${ailment.name}`);
        const ailmentCheckTitle = game.i18n.format(
          "SMT.dice.ailmentCheckTitle",
          {
            ailmentLabel,
            rate: `${ailment.rate}`,
          },
        );

        htmlParts.push(`<div>${ailmentCheckTitle}</div>`);
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
          rate: `${ailmentRate}`,
        });

        // PUSH HTML CONTENT
        // e.g. "TargetName avoided Freeze!" "TargetName is inflicted with Freeze!"
        htmlParts.push(`<h3>${ailmentMsg}</h3>`, await roll.render());
      }
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

async function poisonRoll() {
  const roll = await new Roll("1d10").roll();

  return {
    html: `<div>${game.i18n.format("SMT.ailmentMsg.poison", { damage: `${roll.total}` })}</div>`,
    roll,
  }
}

async function panicRoll(charName: string) {
  const chanceRoll = await new Roll("1d100").roll();
  const rolls = [chanceRoll];

  if (chanceRoll.total <= 50) {
    const effectRoll = await new Roll("1d10").roll();
    rolls.push(effectRoll);

    let panicEffectId = 1;

    // Replace with rollable table?
    switch (effectRoll.total) {
      case 1:
      case 2:
        break;
      case 3:
      case 4:
        panicEffectId = 2;
        break;
      case 5:
      case 6:
        panicEffectId = 3;
        break;
      case 7:
      case 8:
        panicEffectId = 4;
        break;
      case 9:
      case 10:
        panicEffectId = 5;
        break;
    }

    const panicEffect = game.i18n.format(`SMT.ailmentMsg.panic${panicEffectId}`, {name: charName});
    const panicEffectMsg = game.i18n.format("SMT.ailmentMsg.panicFailure", {name: charName, panicEffect});

    return {html: `<h3>${panicEffectMsg}</h3>`, rolls};
  }

  return {html: `<h3>${game.i18n.localize("SMT.ailmentMsg.panicSuccess")}</h3>`, rolls};
}
