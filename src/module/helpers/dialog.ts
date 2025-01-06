interface SuccessCheckDialogData {
  checkName?: string;
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

interface BuffHTMLElement extends HTMLElement {
  physPowerBuff?: { value?: string };
  physPowerDebuff?: { value?: string };
  magPowerBuff?: { value?: string };
  magPowerDebuff?: { value?: string };
  accuracyBuff?: { value?: string };
  accuracyDebuff?: { value?: string };
  resistBuff?: { value?: string };
  resistDebuff?: { value?: string };
}

interface BuffDialogResult {
  physPowerBuff?: number;
  physPowerDebuff?: number;
  magPowerBuff?: number;
  magPowerDebuff?: number;
  accuracyBuff?: number;
  accuracyDebuff?: number;
  resistBuff?: number;
  resistDebuff?: number;
  cancelled?: boolean;
}

export async function renderSuccessCheckDialog({
  checkName = "",
  hint = "",
}: SuccessCheckDialogData = {}): Promise<ModifierDialogResult> {
  const template =
    "systems/smt-tc/templates/dialog/success-modifier-dialog.hbs";

  const content = await renderTemplate(template, {
    checkName,
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

  const content = await renderTemplate(template, {});

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
                physPowerBuff:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.physPowerBuff?.value ?? "0",
                  ) || 0,
                physPowerDebuff:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.physPowerDebuff?.value ?? "0",
                  ) || 0,
                magPowerBuff:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.magPowerBuff?.value ?? "0",
                  ) || 0,
                magPowerDebuff:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.magPowerDebuff?.value ?? "0",
                  ) || 0,
                accuracyBuff:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.accuracyBuff?.value ?? "0",
                  ) || 0,
                accuracyDebuff:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.accuracyDebuff?.value ?? "0",
                  ) || 0,
                resistBuff:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.resistBuff?.value ?? "0",
                  ) || 0,
                resistDebuff:
                  parseInt(
                    ($(html)[0].querySelector("form") as BuffHTMLElement)
                      ?.resistDebuff?.value ?? "0",
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
