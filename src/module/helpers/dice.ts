import { SmtActor } from "../documents/actor/actor.js";
import { SmtItem } from "../documents/item/item.js";
import { SmtTokenDocument } from "../documents/token.js";
import { renderSuccessCheckDialog } from "./dialog.js";

type SuccessLevel = "fumble" | "fail" | "success" | "crit" | "autofail";

interface SuccessCheckOptions {
  tn?: number;
  critBoost?: boolean;
  autoFailThreshold?: number;
}

interface SuccessCheckResult {
  checkSuccess?: SuccessLevel;
  checkRoll?: Roll;
}

interface HitCheckData {
  tnName?: TargetNumber;
  showDialog?: boolean;
  skill?: SmtItem;
  actor?: SmtActor;
  token?: SmtTokenDocument;
}

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

  const name =
    skill?.name ??
    game.i18n.format("SMT.diceV3.checkName", {
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

  const costPaid = await actor.paySkillCost(cost, resourceType);

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
  const includePower = skill?.system.hasPowerRoll && (success || fumble);

  let power = 0;
  let powerRollString = "";

  if (includePower && costPaid) {
    const basePower = skill.system.power;

    powerRollString = generatePowerString({
      basePower,
      critical,
      powerBoost: skill.system.powerBoost,
    });

    const powerRoll = await new Roll(powerRollString).roll();

    rolls.push(powerRoll);

    power = powerRoll.total;
  }

  const targets = Array.from(game.user.targets);

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
  } else if (total >= autoFailThreshold && total <= tn) {
    checkSuccess = "autofail";
  } else if (total <= critThreshold) {
    checkSuccess = "crit";
  } else if (total <= tn) {
    checkSuccess = "success";
  }

  return { checkSuccess, checkRoll };
}

interface PowerRollOptions {
  basePower?: number;
  critical?: boolean;
  powerBoost?: boolean;
}

function generatePowerString({
  basePower = 0,
  critical = false,
  powerBoost = false,
}: PowerRollOptions): string {
  const basePowerString = `${powerBoost ? "2" : "1"}d10x${basePower ? ` + ${basePower}` : ""}`;
  return critical ? `(${basePowerString}) * 2` : basePowerString;
}