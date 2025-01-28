interface SuccessCheckDialogData {
  name?: string;
  // Extra message to show
  hint?: string;
}

interface ModifierDialogResult {
  mod?: number;
  cancelled?: boolean;
}

interface DialogHTMLElement extends HTMLElement {
  mod?: { value?: string };
}

interface AwardHTMLElement extends HTMLElement {
  xp?: { value?: string };
  macca?: { value?: string };
}

interface BuffHTMLElement extends HTMLElement {
  buffType?: { value?: BuffType };
  buffAmount?: { value?: string };
}

interface BuffDialogResult {
  buffType?: BuffType;
  buffAmount?: number;
  cancelBuffs?: boolean;
  cancelDebuffs?: boolean;
  cancelled?: boolean;
}

export async function renderSuccessCheckDialog({
  name = "",
  hint = "",
}: SuccessCheckDialogData = {}): Promise<ModifierDialogResult> {
  const template =
    "systems/smt-tc/templates/dialog/success-modifier-dialog.hbs";

  const content = await renderTemplate(template, {
    name,
    hint,
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
                    ($(html)[0].querySelector("form") as DialogHTMLElement)?.mod
                      ?.value ?? "0",
                  ) || 0,
              }),
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve({ cancelled: true }),
          },
        },
        default: "ok",
        close: () => resolve({ cancelled: true }),
      },
      {},
    ).render(true),
  );
}

export async function renderBuffDialog(): Promise<BuffDialogResult> {
  const template = "systems/smt-tc/templates/dialog/buff-dialog.hbs";

  const content = await renderTemplate(template, {
    buffTypes: CONFIG.SMT.buffTypes,
  });

  return new Promise((resolve) =>
    new Dialog(
      {
        title: game.i18n.localize("SMT.actorSheet.buffs"),
        content,
        buttons: {
          ok: {
            label: "OK",
            callback: (html) =>
              resolve({
                buffType: ($(html)[0].querySelector("form") as BuffHTMLElement)
                  .buffType?.value,
                buffAmount:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.buffAmount?.value ?? "0",
                  ) || 0,
              }),
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve({ cancelled: true }),
          },
          dekaja: {
            label: game.i18n.localize("SMT.dialog.dekajaButton"),
            callback: () => resolve({ cancelBuffs: true }),
          },
          dekunda: {
            label: game.i18n.localize("SMT.dialog.dekundaButton"),
            callback: () => resolve({ cancelDebuffs: true }),
          },
          clearAll: {
            label: game.i18n.localize("SMT.dialog.clearAllBuffs"),
            callback: () => resolve({ cancelBuffs: true, cancelDebuffs: true }),
          },
        },
        default: "ok",
        close: () => resolve({ cancelled: true }),
      },
      {},
    ).render(true),
  );
}

interface AwardDialogResult {
  xp?: number;
  macca?: number;
  cancelled?: boolean;
}

export async function renderAwardDialog(): Promise<AwardDialogResult> {
  const template = "systems/smt-tc/templates/dialog/combat-award-dialog.hbs";

  const content = await renderTemplate(template, {});

  return new Promise((resolve) =>
    new Dialog(
      {
        title: game.i18n.localize("SMT.dialog.combatAwardTitle"),
        content,
        buttons: {
          ok: {
            label: "OK",
            callback: (html) =>
              resolve({
                xp:
                  parseInt(
                    ($(html)[0].querySelector("form") as AwardHTMLElement)?.xp
                      ?.value ?? "0",
                  ) || 0,
                macca:
                  parseInt(
                    ($(html)[0].querySelector("form") as AwardHTMLElement)
                      ?.macca?.value ?? "0",
                  ) || 0,
              }),
          },
          cancel: {
            label: "Cancel",
            callback: () => resolve({ cancelled: true }),
          },
        },
        default: "ok",
        close: () => resolve({ cancelled: true }),
      },
      {},
    ).render(true),
  );
}