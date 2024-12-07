import { SmtItem } from "./item.js";

export class SmtItemSheet extends ItemSheet<SmtItem> {
  static override get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["smt-tc", "sheet", "item"],
      width: 800,
      height: 800,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }

  override get template() {
    const basePath = "systems/smt-tc/templates/item";

    return `${basePath}/item-${this.item.type}-sheet.hbs`;
  }

  override async getData() {
    const context = super.getData();

    const system = this.item.system;

    await foundry.utils.mergeObject(context, {
      system,
    });

    return context;
  }
}