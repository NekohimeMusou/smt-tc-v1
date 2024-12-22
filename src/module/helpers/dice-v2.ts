import { SmtActor } from "../documents/actor/actor.js";
import { SmtItem } from "../documents/item/item.js";
import { renderSuccessCheckDialog } from "./dialog.js";

declare global {
  type SuccessLevel = "fumble" | "fail" | "success" | "crit" | "autofail";
}

type CheckType = "stat" | "derived" | "skill";

interface CheckOptions {
  checkName?: string;
  skill?: SmtItem;
  actor?: SmtActor;
  token?: TokenDocument<SmtActor>;
  targets?: Token<SmtActor>[];
  checkType?: CheckType;
  auto?: boolean;
  accuracyStat?: CharacterStat;
  showDialog?: boolean;
  // For e.g. roll boosts off sheet
  tnMod?: number;
  baseTN?: number;
  critBoost?: boolean;
  autoFailThreshold?: number;
}

interface StatCheckOptions {
  actor?: SmtActor;
  accuracyStat?: CharacterStat;
  tnMod?: number;
  critThreshold?: number;
  autoFailThreshold?: number;
  showDialog?: boolean;
  tnType?: "tn" | "specialTN";
}

interface SuccessData {
  successLevel?: SuccessLevel;
  cancelled?: boolean;
  successRoll?: Roll;
  modifiedTN?: number;
}

async function statCheck({
  actor,
  accuracyStat,
  tnMod = 0,
  critThreshold = 1,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
  showDialog = false,
  tnType = "tn",
}: StatCheckOptions = {}): SuccessData {
  if (!actor || !accuracyStat) {
    throw new TypeError("Stat checks need an actor!");
  }

  const baseTN = actor.system.stats[accuracyStat][tnType];

  const statLabel = game.i18n.localize(`SMT.tn.${accuracyStat}`);
  const checkLabel = game.i18n.format("SMT.dice.statCheckLabel", {
    stat: statLabel,
  });
  const checkName = game.i18n.format("SMT.dice.skillCheckLabel", {
    checkName: checkLabel,
    tn: `${baseTN}`,
  });
  const hint = `<div>${game.i18n.localize("SMT.dice.modifierHint")}</div>`;
  const { mod, cancelled } = showDialog
    ? await renderSuccessCheckDialog({ checkName, hint })
    : { mod: 0 };

  if (cancelled) return { cancelled };

  const modifiedTN = baseTN + tnMod + (mod ?? 0);

  const modifiedCheckName = game.i18n.format("SMT.dice.skillCheckLabel", {
    checkName: checkLabel,
    tn: `${modifiedTN}`,
  });
}

export async function rollCheck({
  skill,
  actor,
  token,
  // targets,
  checkType,
  auto = false,
  accuracyStat,
  tnMod = 0,
  critBoost = false,
  showDialog = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: CheckOptions = {}) {
  let baseTN = tnMod;
  let checkName = "Unknown";

  // Generate the title and base TN for the check, e.g. "St Check: TN XX%" or "Skill Name: TN XX%"
  if (skill && checkType === "skill") {
    baseTN += skill.system.tn;
    checkName = skill.name;
  } else if (actor && accuracyStat) {
    const TNType = checkType === "stat" ? "tn" : "specialTN";
    baseTN += actor.system.stats[accuracyStat][TNType];
    const checkLabel = game.i18n.localize(`SMT.${TNType}.${accuracyStat}`);
    checkName = game.i18n.format("SMT.dice.statCheckLabel", {
      stat: checkLabel,
    });
  } else {
    throw new TypeError("A check requires an actor or an item");
  }

  const successData = await successCheck({
    checkName,
    showDialog,
    baseTN,
    auto,
    critBoost,
  });

  // If they cancel the first dialog, call the whole thing off
  if (successData.cancelled) return;

  const { successLevel = "success", successRoll, modifiedTN = 1 } = successData;

  const rolls: Roll[] = [];

  // If successRoll exists, add that data (if not, it's an auto success)

  const modifiedCheckName = game.i18n.format("SMT.dice.skillCheckLabel", {
    checkName,
    tn: `${modifiedTN}`,
  });

  const htmlParts = [`<div>${modifiedCheckName}</div>`];

  // If it wasn't an auto success, add the roll result label and the roll content
  if (!auto) {
    const resultLabel = game.i18n.format(`SMT.diceResult.${successLevel}`, {
      autoFailThreshold: `${autoFailThreshold}`,
    });
    htmlParts.push(`<div>${resultLabel}</div>`);
  }
  if (successRoll) {
    rolls.push(successRoll);
    htmlParts.push(await successRoll.render());
  }
  // Generate an individual card for the initial success roll
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

  await ChatMessage.create(chatData);

  // Auto successes might still have power rolls, like healing spells
}

// Returns "success" "fail" etc
async function successCheck({
  checkName = "Unknown",
  showDialog = false,
  // Includes any sheet modifier
  baseTN = 1,
  auto = false,
  critBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: CheckOptions = {}): Promise<SuccessData> {
  if (auto) {
    return { successLevel: "success" };
  }
  const hint = game.i18n.localize("SMT.dice.modifierHint");

  const successDialogData = showDialog
    ? await renderSuccessCheckDialog({
        checkName,
        hint,
      })
    : { mod: 0 };

  if (successDialogData.cancelled) {
    return { cancelled: true };
  }

  const dialogMod = successDialogData.mod ?? 0;

  const tn = baseTN + dialogMod;

  const critDivisor = critBoost ? 5 : 10;
  const critThreshold = Math.max(Math.floor(tn / critDivisor), 1);

  const roll = await new Roll("1d100").roll();
  const total = roll.total;
  let successLevel: SuccessLevel = "fail";

  if (total >= 100) {
    successLevel = "fumble";
  } else if (total >= autoFailThreshold) {
    successLevel = "autofail";
  } else if (total <= critThreshold) {
    successLevel = "crit";
  } else if (total <= tn) {
    successLevel = "success";
  }

  return {
    successLevel,
    modifiedTN: tn,
    successRoll: roll,
  };
}
