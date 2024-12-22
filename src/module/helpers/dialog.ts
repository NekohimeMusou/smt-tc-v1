declare global {
  interface SuccessCheckDialogData {
    checkName?: string;
    // Extra message to show
    hint?: string;
  }

  interface ModifierDialogResult {
    mod?: number;
    cancelled?: boolean;
  }
}

interface DialogHTMLElement extends HTMLElement {
  mod?: { value?: string };
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
