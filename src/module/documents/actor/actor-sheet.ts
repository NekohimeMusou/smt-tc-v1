import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../../helpers/active-effects.js";
import { hitCheck } from "../../helpers/dice.js";
import { SmtItem } from "../item/item.js";
import { SmtActor } from "./actor.js";

interface SkillDataObject {
  indexLabel: string;
  skill: SmtItem;
}

export class SmtActorSheet extends ActorSheet<SmtActor> {
  static override get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["smt-tc", "sheet", "actor"],
      template: "systems/smt-tc/templates/actor/actor-sheet.hbs",
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

  override async getData() {
    const context = super.getData();

    const system = this.actor.system;
    const rollData = this.actor.getRollData();

    const skills: SkillDataObject[] = [];

    const basicStrike = this.actor.items.find(
      (item) => item.system.basicStrike,
    );

    if (basicStrike) {
      skills.push({ skill: basicStrike, indexLabel: "—" });
    }

    const actions = this.actor.items
      .filter((item) => item.system.itemType === "skill" && item.system.exclude)
      .map((item) => ({ skill: item, indexLabel: "—" }));

    skills.push(...actions);

    const actualSkills = this.actor.items
      .filter(
        (item) => item.system.itemType === "skill" && !item.system.basicStrike,
      )
      .map((item, index) => ({ skill: item, indexLabel: `${index + 1}` }));

    skills.push(...actualSkills);

    const weapons = this.actor.items.filter(
      (item) => item.system.itemType === "weapon",
    );

    const armor = this.actor.items.filter(
      (item) => item.system.itemType === "armor",
    );

    const items = this.actor.items.filter(
      (item) => item.system.itemType === "item",
    );

    const effects = prepareActiveEffectCategories(this.actor.effects);

    await foundry.utils.mergeObject(context, {
      system,
      rollData,
      skills,
      weapons,
      armor,
      items,
      effects,
      SMT: CONFIG.SMT,
      isGM: game.user.isGM,
    });

    return context;
  }

  override activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").on("click", async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const itemId = li.data("itemId") as string;
      const item = this.actor.items.get(itemId);
      if (item) {
        await item.sheet.render(true);
      }
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Stat TN roll
    html.find(".roll-stat").on("click", this.#onStatRoll.bind(this));

    // Skill roll
    html.find(".roll-skill").on("click", this.#onStatRoll.bind(this));

    // Add Inventory Item
    html.find(".item-create").on("click", this.#onItemCreate.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").on("click", this.#onItemDelete.bind(this));

    html.find(".item-update").on("change", this.#onItemUpdate.bind(this));

    html
      .find(".adjust-modifier")
      .on("click", this.#onModifierChange.bind(this));

    // Active Effect management
    html
      .find(".effect-control")
      .on("click", (ev) => onManageActiveEffect(ev, this.actor));
  }

  async #onModifierChange(event: JQuery.ClickEvent) {
    event.preventDefault();

    const { direction, field, min, max } = $(event.currentTarget).data() as {
      direction: "+" | "-";
      field: "multi" | "tnBoosts";
      min: string | undefined;
      max: string | undefined;
    };

    const increment = direction === "+" ? 1 : -1;

    let newBonus = this.actor.system[field] + increment;

    if (min != undefined) {
      const minimum = parseInt(min) || 0;
      if (newBonus < minimum) {
        newBonus = minimum;
      }
    }

    if (max != undefined) {
      const maximum = parseInt(max) || 0;
      if (newBonus > maximum) {
        newBonus = maximum;
      }
    }

    const data = Object.fromEntries([[`system.${field}`, newBonus]]);

    await this.actor.update(data);
  }

  async #onStatRoll(event: JQuery.ClickEvent) {
    event.preventDefault();
    const target = $(event.currentTarget);

    const tnName = target.data("tnName") as TargetNumber | undefined;
    const itemId = target.closest(".item").data("itemId") as string | undefined;
    const skill = this.actor.items.get(itemId!);

    const showDialog =
      event.shiftKey != game.settings.get("smt-tc", "invertShiftBehavior");

    await hitCheck({
      actor: this.actor,
      token: this.actor.token,
      tnName,
      skill,
      showDialog,
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async #onItemCreate(event: JQuery.ClickEvent) {
    event.preventDefault();
    const element = $(event.currentTarget);
    // Get the type of item to create.
    const system = element.data();
    // Grab any data associated with this control.
    const itemType = system.itemType as string;
    // Initialize a default name.
    const name = itemType.replace(/\b\w+/g, function (s) {
      return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
    });
    const itemName = `${game.i18n.format("SMT.sheet.newItem", { name })}`;
    // Prepare the item object.
    const itemData = {
      name: itemName,
      type: "unstackable",
      system,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    // delete itemData.system.type;

    // Finally, create the item!
    await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  async #onItemDelete(event: JQuery.ClickEvent) {
    const li = $(event.currentTarget).parents(".item");
    const itemId = li.data("itemId") as string;
    const item = this.actor.items.get(itemId);

    if (!item) return;

    const confirmDelete = (await Dialog.confirm({
      title: game.i18n.localize("SMT.dialog.confirmDeleteDialogTitle"),
      content: `<p>${game.i18n.format("SMT.dialog.confirmDeletePrompt", { name: item.name })}</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false,
    })) as boolean;

    if (!confirmDelete) return;

    await item.delete();
    li.slideUp(200, () => this.render(false));
  }

  async #onItemUpdate(event: JQuery.ChangeEvent) {
    event.preventDefault();

    const element = $(event.currentTarget);
    const itemId = element.closest(".item").data("itemId") as string;
    const item = this.actor.items.get(itemId);

    if (!item) return;

    const dtype = element.data("dtype") as string;
    const fieldName = element.data("fieldName") as string;

    let newValue: boolean | string | number;

    if (dtype === "Boolean") {
      newValue = !(element.data("checked") as boolean);
    } else {
      newValue = element.val() as string | number;
    }

    if (fieldName === "system.equipped" && newValue) {
      const equipSlot = item.system.equipSlot;

      const previousEquipment = this.actor.items.find(
        (it) =>
          it.system.itemType === "armor" &&
          it.system.equipSlot === equipSlot &&
          it.system.equipped,
      );

      if (previousEquipment) {
        await previousEquipment.update({ "system.equipped": false });
      }
    }

    const updates = Object.fromEntries([[fieldName, newValue]]);

    await item.update(updates);
  }
}
