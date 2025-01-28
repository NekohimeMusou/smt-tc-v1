import { SmtToken } from "../documents/token.js";
import { renderAwardDialog, renderBuffDialog } from "./dialog.js";

export async function showBuffDialog() {
  if (!game.user.isGM) return;

  const { buffType, buffAmount, cancelBuffs, cancelDebuffs, cancelled } =
    await renderBuffDialog();

  if (cancelled) {
    return;
  }

  const htmlParts = [
    `<h2>${game.i18n.localize(`SMT.buffSpells.${buffType}`)}</h2>`,
  ];

  const buffValue = buffAmount ?? 0;

  const generateBuffOutput =
    !(cancelBuffs ?? cancelDebuffs) && buffType && buffValue > 0;

  for (const tk of canvas.tokens.controlled) {
    const token = tk as SmtToken;

    const buffAdjustments: [string, number][] = [];

    htmlParts.push(`<div>${token.name}</div>`);

    // h3 spell name: SMT.buffSpells.<name>
    // Target list
    // "Phys Power reduced/increased by X"
    // or "all buffs/debuffs reset"

    if (cancelBuffs) {
      Object.keys(CONFIG.SMT.buffSpells).forEach((buffName) =>
        buffAdjustments.push([`system.buffs.${buffName}`, 0]),
      );
    }

    if (cancelDebuffs) {
      Object.keys(CONFIG.SMT.debuffSpells).forEach((buffName) =>
        buffAdjustments.push([`system.buffs.${buffName}`, 0]),
      );
    }

    if (generateBuffOutput) {
      buffAdjustments.push([
        `system.buffs.${buffType}`,
        token.actor.system.buffs[buffType] + buffValue,
      ]);
    }

    await token.actor.update(Object.fromEntries(buffAdjustments));
  }

  if (cancelBuffs) {
    htmlParts.push(
      `<div>${game.i18n.localize("SMT.macro.buffDialogDekaja")}</div>`,
    );
  }

  if (cancelDebuffs) {
    htmlParts.push(
      `<div>${game.i18n.localize("SMT.macro.buffDialogDekunda")}</div>`,
    );
  }

  if (generateBuffOutput) {
    const buffEffectLabel = game.i18n.localize(
      `SMT.buffEffectLabels.${buffType}`,
    );
    const isBuff = Object.keys(CONFIG.SMT.buffSpells).includes(buffType);
    const resultType = isBuff ? "buffDialogResult" : "debuffDialogResult";
    const resultLabel = game.i18n.format(`SMT.macro.${resultType}`, {
      stat: buffEffectLabel,
      amount: `${buffValue}`,
    });

    htmlParts.push(`<div>${resultLabel}</div>`);
  }

  const content = htmlParts.join("\n");

  const chatData = {
    user: game.user.id,
    content,
    speaker: {
      scene: game.scenes.current,
      alias: "BuffBot",
    },
  };

  return await ChatMessage.create(chatData);
}

export async function showAwardDialog() {
  if (!game.user.isGM) return;

  const {
    xp: xpEarned,
    macca: maccaEarned,
    cancelled,
  } = await renderAwardDialog();

  if (cancelled) return;

  const htmlParts: string[] = [];

  for (const tk of canvas.tokens.controlled) {
    const token = tk as SmtToken;

    if (!token.isOwner) return;

    const newXP = token.actor.system.xp + xpEarned!;
    const newMacca = token.actor.system.macca + maccaEarned!;

    const charName = token.name;
    const xp = `${xpEarned}`;
    const macca = `${maccaEarned}`;

    htmlParts.push(
      `<div>${game.i18n.format("SMT.macro.award", { charName, xp, macca })}</div>`,
    );

    await token.actor.update({
      "system.xp": newXP,
      "system.macca": newMacca,
    });
  }

  if (htmlParts.length < 1) {
    return;
  }

  const content = htmlParts.join("\n");

  const chatData = {
    user: game.user.id,
    content,
    speaker: {
      scene: game.scenes.current,
      alias: "Ca$h bot",
    },
  };

  return await ChatMessage.create(chatData);
}

export async function applyHealingFountain() {
  const tokens = canvas.tokens.controlled as SmtToken[];

  const htmlParts: string[] = [];

  for (const token of tokens) {
    const { healed, insufficientMacca, hpAmount, mpAmount, healingCost } =
      await token.actor.healingFountain();
    const charName = token.name;
    const hp = `${hpAmount ?? 0}`;
    const mp = `${mpAmount ?? 0}`;
    const cost = `${healingCost ?? 0}`;

    if (insufficientMacca) {
      htmlParts.push(
        `<div>${game.i18n.format("SMT.macro.insufficientMacca", { charName, cost })}</div>`,
      );
    } else if (healed) {
      htmlParts.push(
        `<div>${game.i18n.format("SMT.macro.healingAmt", { charName, hp, mp, cost })}</div>`,
      );
    } else {
      htmlParts.push(
        `<div>${game.i18n.format("SMT.macro.alreadyHealed", { charName })}</div>`,
      );
    }
  }

  const content = htmlParts.join("\n");

  const chatData = {
    user: game.user.id,
    content,
    speaker: {
      alias: "Lady of the Fount",
    },
  };

  return await ChatMessage.create(chatData);
}
