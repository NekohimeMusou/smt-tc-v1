import { SmtToken } from "../documents/token.js";
import { renderAwardDialog, renderBuffDialog } from "./dialog.js";

export async function showBuffDialog() {
  const {
    physPowerBuff,
    physPowerDebuff,
    magPowerBuff,
    magPowerDebuff,
    accuracyBuff,
    accuracyDebuff,
    resistBuff,
    resistDebuff,
    cancelled,
  } = await renderBuffDialog();

  if (cancelled) {
    return;
  }

  for (const tk of canvas.tokens.controlled) {
    const token = tk as SmtToken;

    if (!token.isOwner) return;

    const currentBuffs = token.actor.system.buffs;

    const currentDebuffs = token.actor.system.debuffs;

    const updateData = {
      "system.buffs.physPower": Math.max(
        currentBuffs.physPower + (physPowerBuff ?? 0),
        0,
      ),
      "system.buffs.magPower": Math.max(
        currentBuffs.magPower + (magPowerBuff ?? 0),
        0,
      ),
      "system.buffs.accuracy": Math.max(
        currentBuffs.accuracy + (accuracyBuff ?? 0),
        0,
      ),
      "system.buffs.resist": Math.max(
        currentBuffs.resist + (resistBuff ?? 0),
        0,
      ),
      "system.debuffs.physPower": Math.max(
        currentDebuffs.physPower + (physPowerDebuff ?? 0),
        0,
      ),
      "system.debuffs.magPower": Math.max(
        currentDebuffs.magPower + (magPowerDebuff ?? 0),
        0,
      ),
      "system.debuffs.accuracy": Math.max(
        currentDebuffs.accuracy + (accuracyDebuff ?? 0),
        0,
      ),
      "system.debuffs.resist": Math.max(
        currentDebuffs.resist + (resistDebuff ?? 0),
        0,
      ),
    };

    await token.actor.update(updateData);
  }
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
