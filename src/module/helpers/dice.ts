import { SmtActor } from "../documents/actor/actor.js";
import { SmtItem } from "../documents/item/item.js";
import { SmtToken, SmtTokenDocument } from "../documents/token.js";
import { renderSuccessCheckDialog } from "./dialog.js";

type SuccessLevel = "fumble" | "fail" | "success" | "crit";

interface SuccessCheckOptions {
  tn?: number;
  critBoost?: boolean;
  autoFailThreshold?: number;
}

interface SuccessCheckResult {
  checkSuccess?: SuccessLevel;
  checkRoll?: Roll;
}

interface PowerRollOptions {
  basePower?: number;
  critical?: boolean;
  powerBoost?: boolean;
}

interface HitCheckData {
  tnName?: TargetNumber;
  showDialog?: boolean;
  skill?: SmtItem;
  actor?: SmtActor;
  token?: SmtTokenDocument;
}

// TO ADD
//
export async function hitCheck({
  tnName,
  actor,
  skill,
  showDialog = false,
  token,
}: HitCheckData = {}) {
  if (!actor) {
    return ui.notifications.error("Missing Actor in hitCheck");
  }

  const auto = skill?.system.auto;

  // Either the name of the skill, or e.g. "Strength Check"
  // or "Negotiation Check"
  const name =
    skill?.name ??
    game.i18n.format("SMT.dice.checkName", {
      tnName: `${game.i18n.localize(`SMT.tnNames.${tnName}`)}`,
    });

  const { mod, cancelled } =
    showDialog && !auto
      ? await renderSuccessCheckDialog({
          name,
          hint: game.i18n.localize("SMT.dice.modifierHint"),
        })
      : {};

  if (cancelled) return;

  const cost = skill?.system.cost ?? 0;

  const resourceType = skill?.system.costType ?? "mp";

  // Try to pay the skill cost, if any
  const costPaid = await actor.paySkillCost(cost, resourceType);

  // Drop TN boosts if it's not an auto skill
  if (!auto && costPaid) {
    await actor.update({ "system.tnBoosts": 0 });
  }

  // Unfocus
  const focused = actor.statuses.has("focused");
  await actor.changeStatus("focused", "off");

  const effect = skill?.system.effect;

  const tn = (skill?.system.tn ?? actor.system.tn?.[tnName!] ?? 1) + (mod ?? 0);

  const autoFailThreshold =
    skill?.system.autoFailThreshold ?? actor.system.autoFailThreshold;

  const { checkSuccess, checkRoll }: SuccessCheckResult =
    !auto && costPaid
      ? await successCheck({
          tn,
          autoFailThreshold,
          critBoost: skill?.system.critBoost,
        })
      : {};

  const success = checkSuccess === "crit" || checkSuccess === "success";
  const critical = checkSuccess === "crit";
  const fumble = checkSuccess === "fumble";

  const rolls: Roll[] = [];

  if (checkRoll) {
    rolls.push(checkRoll);
  }

  const checkTotal = checkRoll?.total ?? 0;

  // You hurt yourself if you fumble
  const includePower = (skill?.system.hasPowerRoll && (success || fumble))!;

  let power = 0;
  let powerRollString = "";

  if (includePower && costPaid) {
    // 1.5x base power with affinity boost (Elec Boost, Fire Boost etc)
    const affinity = skill.system
      .affinity as keyof typeof actor.system.elementBoosts;
    const boost = actor.system.elementBoosts[affinity];
    const basePower = boost
      ? Math.floor(skill.system.power * 1.5)
      : skill.system.power;

    powerRollString = generatePowerString({
      basePower,
      critical,
      powerBoost: skill.system.powerBoost,
    });

    const powerRoll = await new Roll(powerRollString).roll();

    rolls.push(powerRoll);

    power = powerRoll.total;

    // Double the power if focused
    if (focused && skill.system.damageType === "phys") {
      power *= 2;
    }

    // Halve the power if poisoned
    if (actor.system.poison) {
      power = Math.floor(power / 2);
    }
  }

  const targets = skill
    ? (Array.from(game.user.targets) as SmtToken[]).map((token) =>
        processTarget(token, skill, critical, includePower),
      )
    : [];

  const context = {
    name,
    cost,
    resourceType,
    costPaid,
    effect,
    auto,
    checkSuccess,
    checkTotal,
    includePower,
    tn,
    power,
    powerRollString,
    targets,
  };

  const content = await renderTemplate(
    "systems/smt-tc/templates/chat/dice-roll.hbs",
    context,
  );

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

async function successCheck({
  tn = 1,
  critBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: SuccessCheckOptions = {}): Promise<SuccessCheckResult> {
  const critThreshold = Math.max(Math.floor(tn / (critBoost ? 5 : 10)), 1);

  const checkRoll = await new Roll("1d100").roll();

  const total = checkRoll.total;

  let checkSuccess: SuccessLevel = "fail";

  if (total >= 100) {
    checkSuccess = "fumble";
  } else if (total <= critThreshold) {
    checkSuccess = "crit";
  } else if (total <= tn && total <= autoFailThreshold) {
    checkSuccess = "success";
  }

  return { checkSuccess, checkRoll };
}

function generatePowerString({
  basePower = 0,
  critical = false,
  powerBoost = false,
}: PowerRollOptions): string {
  const basePowerString = `${powerBoost ? "2" : "1"}d10x${basePower ? ` + ${basePower}` : ""}`;
  return critical ? `(${basePowerString}) * 2` : basePowerString;
}

interface TargetData {
  rolls?: Roll[];
}

async function processTarget(
  token: SmtToken,
  skill: SmtItem,
  totalPower: number,
  critical: boolean,
  includePower: boolean,
): Promise<TargetData> {
  const rolls: Roll[] = [];

  const target = token.actor;

  const skillAffinity = skill.system.affinity;
  const physAffinity = target.system.affinities.phys;

  // Do we ignore the target's phys affinity? e.g. Freeze
  const ignoreAffinity =
    target.system.ignorePhysAffinity &&
    skillAffinity === "phys" &&
    physAffinity !== "weak";

  const targetAffinity = ignoreAffinity
    ? "none"
    : target.system.affinities[skillAffinity];

  const pierce =
    skill.system.pierce &&
    !["weak", "none", "reflect"].includes(targetAffinity);

  const skipDodge =
    // Don't dodge healing spells
    ["healing", "support", "unique"].includes(skill.system.affinity) ||
    // Don't dodge if you can't take actions
    target.system.noActions ||
    // Don't dodge if you repel the attack
    targetAffinity === "reflect" ||
    // Don't dodge if you drain or null either, unless it pierces
    (["drain", "null"].includes(targetAffinity) && !pierce);

  const pinhole = skill.system.pinhole;

  // Halve the dodge TN if the skill is Pinhole
  const dodgeTN = pinhole
    ? Math.floor(target.system.tn.dodge / 2)
    : target.system.tn.dodge;

  const { checkSuccess: dodgeSuccess, checkRoll: dodgeRoll } = skipDodge
    ? {}
    : await successCheck({
        tn: dodgeTN,
        autoFailThreshold: target.system.autoFailThreshold,
    });
  
  const dodged = dodgeSuccess === "crit" || (dodgeSuccess === "success" && !critical);

  if (dodgeRoll) {
    rolls.push(dodgeRoll);
  }

  let power = totalPower;

  // If the attack was a crit and the dodge was a normal success,
  // The crit is downgraded to a normal hit
  const critDowngrade = critical && dodgeSuccess === "crit";

  if (critDowngrade) {
    power = Math.floor(power / 2);
  }

  // If the dodge was fumbled, the power is doubled
  if (dodgeSuccess === "fumble")
  // Affinity
  // Ailment
}
