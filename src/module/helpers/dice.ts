import { SmtActor } from "../documents/actor/actor.js";

interface RollOptions {
  rollName?: string;
  token?: TokenDocument<SmtActor>;
  actor?: SmtActor;
}

interface OldSuccessRollOptions extends RollOptions {
  hasCritBoost?: boolean;
  baseTn?: number;
  autoFailThreshold?: number;
  auto?: boolean;
  showDialog?: boolean;
}

interface OldPowerRollOptions extends RollOptions {
  basePower?: number;
  potency?: number;
  hasPowerBoost?: boolean;
  affinity?: Affinity;
  atkCategory?: AttackCategory;
  showDialog?: boolean;
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

interface AilmentData {
  name: Ailment;
  accuracy: number;
}

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
export async function oldSuccessRoll({
  rollName = "",
  token,
  actor,
  showDialog = false,
  hasCritBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
  baseTn = 0,
  auto = false,
}: OldSuccessRollOptions = {}) {
  // Handle auto success
  if (auto) return await autoSuccess({ rollName, token, actor });

  const dialogLabel = game.i18n.format("SMT.dice.checkLabel", {
    rollName,
    tn: `${baseTn}`,
  });

  const { mod, cancelled, critBoost } = showDialog
    ? await successModDialog(
        dialogLabel,
        game.i18n.localize("SMT.dice.modifierHint"),
      )
    : { mod: 0, cancelled: false, critBoost: hasCritBoost };

  if (cancelled) return;

  const dlgMod = mod ?? 0;

  const tn = baseTn + dlgMod;

  const modifiedCheckLabel = game.i18n.format("SMT.dice.checkLabel", {
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
    `<p>${game.i18n.format("SMT.dice.autoCheckLabel", { rollName: rollNameString })}</p>`,
    `<h3>${game.i18n.localize("SMT.diceResult.autoSuccess")}</h3>`,
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
    const critHint = game.i18n.localize("SMT.diceResult.critHint");
    return `<div class=flexcol><div>${critMsg}</div><div>${critHint}</div></div>`;
  } else if (rollTotal <= tn) {
    return game.i18n.localize("SMT.diceResult.success");
  }

  return game.i18n.localize("SMT.diceResult.fail");
}

async function successModDialog(
  checkLabel: string,
  hint = "",
  hasCritBoost = false,
): Promise<ModDialogResult> {
  const template =
    "systems/smt-tc/templates/dialog/success-modifier-dialog.hbs";
  const content = await renderTemplate(template, {
    checkLabel,
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

export async function oldPowerRoll({
  rollName = "Generic",
  token,
  actor,
  showDialog,
  basePower = 0,
  potency = 0,
  hasPowerBoost,
  affinity = "unique",
  atkCategory = "phys",
}: OldPowerRollOptions = {}) {
  const dialogLabel = game.i18n.format("SMT.dice.powerDialogMsg", {
    name: rollName,
  });

  const { mod, cancelled } = showDialog
    ? await successModDialog(dialogLabel)
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

interface SkillRollOptions extends RollOptions {
  accuracyStat?: AccuracyStat;
  baseTn?: number;
  autoFailThreshold?: number;
  // powerData?: PowerRollOptions;
  hasCritBoost?: boolean;
  ailment?: AilmentData;
  targets?: Token<SmtActor>[];
  pinhole?: boolean;
  showDialog?: boolean;
}

// TODO: Make power roll clickable from sheet (in case no target)
export async function skillRoll({
  rollName = "Unknown",
  accuracyStat = "auto",
  baseTn = 1,
  // ailment,
  // powerData,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
  hasCritBoost = false,
  // pinhole = false,
  showDialog = false,
  actor,
  token,
  // targets,
}: SkillRollOptions = {}) {
  // Roll name: "Heat Wave" or "Lu Check"

  const contentParts: string[] = [];
  const rolls: Roll[] = [];

  // We only need to *roll* the dice if there's a TN
  if (accuracyStat === "auto") {
    contentParts.push(
      `<h3>${game.i18n.format("SMT.diceResult.autoCheckLabel", { rollName })}</h3>`,
    );
  } else {
    // Show the TN modifier dialog
    const {
      cancelled,
      htmlParts: rollParts,
      roll: hitRoll,
    } = await successRoll({
      rollName,
      baseTn,
      hasCritBoost,
      showDialog,
      autoFailThreshold,
    });

    if (cancelled) return;

    contentParts.concat(rollParts);
    rolls.push(hitRoll);
  }

  // If target: roll Dodge

  // Roll power, if applicable
  // - If target: check affinity and subtract resist
  // - AFFINITY BEFORE PHYS/MAG RESIST

  // Roll ailment chance, if applicable
  // - AFFINITY APPLIES TO THIS TOO
  // Apply status, if applicable

  const content = contentParts.join("\n");

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

async function successRoll({
  rollName = "Unknown",
  baseTn = 1,
  hasCritBoost = false,
  showDialog = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: SkillRollOptions = {}) {
  const dialogLabel = game.i18n.format("SMT.dice.checkLabel", {
    rollName,
    tn: `${baseTn}`,
  });

  const { mod, cancelled, critBoost } = showDialog
    ? await successModDialog(
        dialogLabel,
        game.i18n.localize("SMT.dice.modifierHint"),
      )
    : { mod: 0, cancelled: false, critBoost: hasCritBoost };

  if (cancelled) return { cancelled };

  const tn = baseTn + (mod ?? 0);

  const modifiedCheckLabel = game.i18n.format("SMT.dice.checkLabel", {
    rollName,
    tn: `${tn}`,
  });

  const htmlParts = [`<p>${modifiedCheckLabel}</p>`];

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

  htmlParts.push(`<h3>${resultLabel}</h3>`, await roll.render());

  return { cancelled: false, htmlParts, roll };
}

// For direct TN rolls off the sheet (e.g. Lu checks, Save checks)
export async function statRoll(
  actor: SmtActor,
  token: TokenDocument<SmtActor> | undefined,
  tnType: StatRollTNType,
  accuracyStat: CharacterStat,
  showDialog: boolean,
  hasCritBoost = false,
) {
  const data = actor.system;
  const baseTn = data.stats[accuracyStat][tnType];
  const autoFailThreshold = data.autoFailThreshold;

  // Label to show in dialog box
  const checkLabel = game.i18n.format("SMT.dice.statCheckMsg", {
    stat: accuracyStat,
    tn: `${baseTn}`,
  });
  const hint = game.i18n.localize("SMT.dice.modifierHint");

  const { mod, cancelled, critBoost } = showDialog
    ? await successModDialog(checkLabel, hint, hasCritBoost)
    : { mod: 0, cancelled: false, critBoost: hasCritBoost };

  if (cancelled) return;

  const tn = baseTn + (mod ?? 0);

  // e.g. "St Check: TN 38%""
  const rollName = game.i18n.format("SMT.dice.statCheckMsg", {
    stat: accuracyStat,
    tn: `${tn}`,
  });

  const htmlParts = [`<p>${rollName}</p>`];

  // Returns result label
  const { rollHtml, rolls } = await accuracyRoll({
    tn,
    critBoost,
    autoFailThreshold,
  });

  htmlParts.concat(rollHtml);

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

  return await ChatMessage.create(chatData);
}

// Currently only handles stat rolls
async function accuracyRoll({
  tn = 1,
  critBoost = false,
  autoFailThreshold = CONFIG.SMT.defaultAutofailThreshold,
}: AccuracyRollOptions = {}): Promise<AccuracyRollResult> {
  const roll = await new Roll("1d100").roll();

  const rolls = [roll];

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

  const renderedRoll = await roll.render();

  return { rollHtml: [`<h3>${resultLabel}</h3>`, renderedRoll], rolls };
}

interface AccuracyRollResult {
  rollHtml: string[];
  rolls: Roll[];
}

interface AccuracyRollOptions {
  rollName?: string;
  tn?: number;
  critBoost?: boolean;
  autoFailThreshold?: number;
}

interface ModDialogResult {
  mod?: number;
  cancelled?: boolean;
  critBoost?: boolean;
}
