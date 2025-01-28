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

  const { xp, macca, cancelled } = await renderAwardDialog();

  if (cancelled) return;

  for (const tk of canvas.tokens.controlled) {
    const token = tk as SmtToken;

    if (!token.isOwner) return;

    const newXP = token.actor.system.xp + xp!;
    const newMacca = token.actor.system.macca + macca!;

    await token.actor.update({
      "system.xp": newXP,
      "system.macca": newMacca,
    });
  }
}

export async function applyHealingFountain() {
  const tokens = canvas.tokens.controlled as SmtToken[];

  for (const token of tokens) {
    await token.actor.healingFountain();
  }
}