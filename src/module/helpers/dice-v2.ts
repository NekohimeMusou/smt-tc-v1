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

interface SimplerCheckData {
  tnName?: TargetNumber;
  showDialog?: boolean;
  skill?: SmtItem;
  actor?: SmtActor;
  token?: SmtTokenDocument;
}

export async function simplerCheck({
  tnName,
  actor,
  skill,
  showDialog = false,
  token,
}: SimplerCheckData = {}) {
  if (!actor) {
    return ui.notifications.error("Missing Actor in simplerCheck");
  }

  const auto = skill?.system.auto;

  const name =
    skill?.name ??
    game.i18n.format("SMT.diceV3.checkName", { tnName: `${tnName}` });

  const { mod, cancelled } =
    showDialog && !auto
      ? await renderSuccessCheckDialog({
          name,
          hint: game.i18n.localize("SMT.dice.modifierHint"),
        })
      : {};

  if (cancelled) return;

  const cost = skill?.system.cost ?? 0;

  const resourceType = skill?.system.costType;

  const effect = skill?.system.effect;

  const tn = (skill?.system.tn ?? actor.system.tn?.[tnName!] ?? 1) + (mod ?? 0);

  const autoFailThreshold =
    skill?.system.autoFailThreshold ?? actor.system.autoFailThreshold;

  const { checkSuccess, checkRoll }: SuccessCheckResult = !auto
    ? await successCheck({
        tn,
        autoFailThreshold,
        critBoost: skill?.system.critBoost,
      })
    : {};

  const rolls: Roll[] = [];

  if (checkRoll) {
    rolls.push(checkRoll);
  }

  const checkTotal = checkRoll?.total;

  const hasPowerRoll = skill?.system.hasPowerRoll;

  let power = 0;
  let powerRollString = "";

  // Do this even if it's a miss, in case they fumble
  // TODO: Account for fumbles
  if (hasPowerRoll) {
    const basePower = skill.system.power;

    powerRollString = `${skill.system.powerBoost ? "2" : "1"}d10${basePower ? ` + ${basePower}` : ""}`;

    const powerRoll = await new Roll(powerRollString).roll();

    rolls.push(powerRoll);

    power = powerRoll.total;
  }

  const targets = game.user.targets;

  const context = {
    name,
    cost,
    resourceType,
    effect,
    auto,
    checkSuccess,
    checkTotal,
    hasPowerRoll,
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
