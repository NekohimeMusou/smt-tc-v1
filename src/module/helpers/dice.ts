import { SmtActor } from "../documents/actor/actor.js";

interface RollOptions {
  rollName?: string;
  token?: TokenDocument<SmtActor>;
  actor?: SmtActor;
  showDialog?: boolean;
}

interface SuccessRollOptions extends RollOptions {
  hasCritBoost?: boolean;
  baseTn?: number;
  autoFailThreshold?: number;
  auto?: boolean;
}

interface PowerRollOptions extends RollOptions {
  basePower?: number;
  potency?: number;
  hasPowerBoost?: boolean;
  affinity?: Affinity;
  atkCategory?: AttackCategory;
}

interface ModElement extends HTMLElement {
  mod?: { value?: string };
  critBoost?: { value?: boolean };
}

interface ResultLabelOptions {
  rollTotal?: number;
  tn?: number;
  critThreshold?: number;
  autoFailThreshold?: number;
}

// interface AilmentData {
//   name: string;
//   accuracy: number;
// }

declare global {
  interface SuccessRollData {
    rollType: SuccessRollCategory;
    stat: CharacterStat;
  }

  interface PowerRollData {
    rollName?: string;
    atkCategory?: AttackCategory;
    affinity?: Affinity;
    basePower?: number;
  }
}

// TODO: Refactor this to work with skills + get rid of that ugly auto-success hack
export async function successRoll({
  rollName = "",
  token,
  actor,
  showDialog = false,
  hasCritBoost = false,
  autoFailThreshold = 96,
  baseTn = 0,
  auto = false,
}: SuccessRollOptions = {}) {
  // Handle auto success
  if (auto) return await autoSuccess({ rollName, token, actor });

  const dialogLabel = game.i18n.format("SMT.dice.checkMsg", {
    rollName,
    tn: `${baseTn}`,
  });

  const { mod, cancelled, critBoost } = showDialog
    ? await showModifierDialog(
        dialogLabel,
        game.i18n.localize("SMT.dice.modifierHint"),
      )
    : { mod: 0, cancelled: false, critBoost: hasCritBoost };

  if (cancelled) return;

  const dialogMod = mod ?? 0;

  const tn = baseTn + dialogMod;

  const modifiedCheckLabel = game.i18n.format("SMT.dice.checkMsg", {
    rollName,
    tn: `${tn}`,
  });

  const msgParts = [`<p>${modifiedCheckLabel}</p>`];

  const roll = await new Roll("1d100").roll();

  const rollTotal = roll.total;

  const critDivisor = critBoost ? 5 : 10;

  // A 1 is always a crit
  const critThreshold = Math.max(Math.floor(tn / critDivisor), 1);

  const resultLabel = getResultLabel({
    rollTotal,
    tn,
    critThreshold,
    autoFailThreshold,
  });

  const rollHTML = await roll.render();

  msgParts.push(`<h3>${resultLabel}</h3>`, rollHTML);

  const chatData = {
    user: game.user.id,
    // flavor: optional flavor text
    content: msgParts.join("\n"),
    speaker: {
      scene: game.scenes.current,
      token,
      actor,
    },
    rolls: [roll],
  };

  return await ChatMessage.create(chatData);
}

async function autoSuccess({ rollName, token, actor }: RollOptions = {}) {
  const rollNameString = `${rollName}`;
  const content = [
    `<p>${game.i18n.format("SMT.dice.autoCheckMsg", { rollName: rollNameString })}</p>`,
    `<h3>${game.i18n.localize("SMT.dice.result.autoSuccess")}</h3>`,
  ].join("\n");

  const chatData = {
    user: game.user.id,
    content,
    speaker: {
      scene: game.scenes.current,
      token,
      actor,
    },
  };

  return await ChatMessage.create(chatData);
}

function getResultLabel({
  rollTotal = 100,
  tn = 1,
  critThreshold = 1,
  autoFailThreshold = 96,
}: ResultLabelOptions = {}) {
  if (rollTotal >= 100) {
    return game.i18n.localize("SMT.dice.result.fumble");
  } else if (rollTotal >= autoFailThreshold) {
    return game.i18n.format("SMT.dice.result.autofail", {
      threshold: `${autoFailThreshold}`,
    });
  } else if (rollTotal <= critThreshold) {
    const critMsg = game.i18n.localize("SMT.dice.result.crit");
    const critHint = game.i18n.localize("SMT.dice.result.critHint");
    return `<div class=flexcol><div>${critMsg}</div><div>${critHint}</div></div>`;
  } else if (rollTotal <= tn) {
    return game.i18n.localize("SMT.dice.result.success");
  }

  return game.i18n.localize("SMT.dice.result.fail");
}

async function showModifierDialog(
  dialogLabel: string,
  hint = "",
  hasCritBoost = false,
): Promise<{ mod: number; critBoost: boolean; cancelled?: boolean }> {
  const template = "systems/smt-tc/templates/dialog/modifier-dialog.hbs";
  const content = await renderTemplate(template, {
    checkLabel: dialogLabel,
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

export async function powerRoll({
  rollName = "Generic",
  token,
  actor,
  showDialog,
  basePower = 0,
  potency = 0,
  hasPowerBoost,
  affinity = "unique",
  atkCategory = "phys",
}: PowerRollOptions = {}) {
  const dialogLabel = game.i18n.format("SMT.dice.powerDialogMsg", {
    name: rollName,
  });

  const { mod, cancelled } = showDialog
    ? await showModifierDialog(dialogLabel)
    : { mod: 0, cancelled: false };

  if (cancelled) return;

  const diceMod = mod ?? 0;

  const rollString = [
    `${hasPowerBoost ? 2 : 1}d10x`,
    _getDiceTerm(basePower),
    _getDiceTerm(potency),
    _getDiceTerm(diceMod),
  ].join("");

  const roll = await new Roll(rollString).roll();

  const powerTotalString = game.i18n.format("SMT.dice.powerChatCardMsg", {
    power: `${roll.total}`,
    affinity: game.i18n.localize(`SMT.affinities.${affinity}`),
    atkCategory: game.i18n.localize(`SMT.atkCategory.${atkCategory}`),
  });

  const content = [
    `<h3>${rollName}</h3>`,
    `<p>${powerTotalString}</p>`,
    await roll.render(),
  ].join("\n");

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

function _getDiceTerm(num: number) {
  if (!num) {
    return "";
  }

  return Math.sign(num) < 0 ? ` - ${num}` : ` + ${num}`;
}
