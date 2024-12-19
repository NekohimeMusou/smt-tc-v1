import { SMT } from "../../config/config.js";
import {
  oldPowerRoll,
  oldSuccessRoll,
  skillRoll,
  statRoll,
} from "../../helpers/dice.js";
import { SmtActor } from "./actor.js";

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
    const skills = this.actor.items.filter((item) => item.type === "skill");

    // Dumb hack so the basic strike is always first
    const weapons = this.actor.items.filter(
      (item) => item.system.itemType === "weapon" && item.system.basicStrike,
    );
    weapons.concat(
      this.actor.items.filter(
        (item) => item.system.itemType === "weapon" && !item.system.basicStrike,
      ),
    );

    // TODO: Figure out active effects in TS
    // const effects = prepareActiveEffectCategories(this.item.effects);

    await foundry.utils.mergeObject(context, {
      system,
      rollData,
      skills,
      weapons,
      SMT,
    });

    return context;
  }

  override activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    // html.find(".item-edit").click((ev) => {
    //   const li = $(ev.currentTarget).parents(".item");
    //   const item = this.actor.items.get(li.data("itemId"));
    //   item.sheet.render(true);
    // });

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Stat TN roll
    html.find(".roll-stat").on("click", this.#onStatRoll.bind(this));

    // Power roll
    html.find(".roll-power").on("click", this.#onPowerRoll.bind(this));

    // Add Inventory Item
    // html.find(".item-create").on("click", this.#onItemCreate.bind(this));

    // Delete Inventory Item
    // html.find(".item-delete").on("click", this.#onItemDelete(ev));

    // Active Effect management
    // html.find(".effect-control").on("click", onManageActiveEffect(ev, this.actor));
  }

  async #onStatRoll(event: JQuery.ClickEvent) {
    event.preventDefault();

    const target = $(event.currentTarget);
    const { rollType, stat } = target.data() as SuccessRollData;

    // Make sure this really is SuccessRollData
    if (
      !SMT.successRollCategories.includes(rollType) ||
      !Object.keys(this.actor.system.stats).includes(stat)
    ) {
      return ui.notifications.error("Malformed roll data (in #onStatRoll)");
    }

    const baseTn = this.actor.system.stats[stat][rollType];

    const rollCategory = rollType === "tn" ? "stats" : "specialTN";

    const rollName = game.i18n.localize(`SMT.${rollCategory}.${stat}`);

    const showDialog =
      event.shiftKey != game.settings.get("smt-tc", "invertShiftBehavior");

    return await oldSuccessRoll({
      rollName,
      token: this.actor.token,
      actor: this.actor,
      showDialog,
      baseTn,
    });
  }

  async #onPowerRoll(event: JQuery.ClickEvent) {
    event.preventDefault();

    const target = $(event.currentTarget);

    const { rollName, atkCategory, basePower, affinity } =
      target.data() as PowerRollData;

    const showDialog =
      event.shiftKey != game.settings.get("smt-tc", "invertShiftBehavior");

    return await oldPowerRoll({
      rollName,
      token: this.actor.token,
      actor: this.actor,
      showDialog,
      basePower,
      affinity,
      atkCategory,
    });
  }

  #onSkillRoll(event: JQuery.ClickEvent) {
    event.preventDefault();

    const target = $(event.currentTarget);
    const { itemId, tnType, accuracyStat }: SkillRollData = target
      .closest(".item")
      .data();
    const showDialog =
      event.shiftKey != game.settings.get("smt-tc", "invertShiftBehavior");

    if (tnType && accuracyStat) {
      // It's a stat roll off the sheet
      // Roll name should be like:
      // St Check: TN XX%
      // Dodge:  TN XX%
      // Save: TN XX%
      const rollLabel = game.i18n.localize(`SMT.${tnType}.${accuracyStat}`);
      // Final rollName to pass to function
      const rollName = game.i18n.format("SMT.dice.statCheckMsg", {
        rollLabel,
        tn: `${this.actor.system.stats[accuracyStat][tnType]}`,
      });

      const baseTn = this.actor.system.stats[accuracyStat][tnType];
      const actor = this.actor;
      const token = actor.token;
      const targets = Array.from(
        game.user.targets.values(),
      ) as Token<SmtActor>[];

      return skillRoll({
        rollName,
        accuracyStat,
        baseTn,
        showDialog,
        actor,
        token,
        targets,
      });
    }

    // Otherwise, it's hopefully a skill
    const skill = this.actor.items.get(itemId ?? "");

    if (!skill) return;
  }

  async #onSheetStatRoll(event: JQuery.ClickEvent) {
    event.preventDefault();
    const target = $(event.currentTarget);

    const { tnType, accuracyStat } = target.data() as StatRollFormData;
    const showDialog =
      event.shiftKey != game.settings.get("smt-tc", "invertShiftBehavior");

    await statRoll(
      this.actor,
      this.actor.token,
      tnType,
      accuracyStat,
      showDialog,
    );
  }

  // /**
  //  * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
  //  * @param {Event} event   The originating click event
  //  * @private
  //  */
  // async #onItemCreate(event) {
  //   event.preventDefault();
  //   const element = event.currentTarget;
  //   // Get the type of item to create.
  //   const type = element.dataset.type;
  //   // Grab any data associated with this control.
  //   const system = duplicate(element.dataset);
  //   // Initialize a default name.
  //   const itemName = `${game.i18n.format("SMT.sheet.newItem", { name: type.capitalize() })}`;
  //   // Prepare the item object.
  //   const itemData = {
  //     name: itemName,
  //     type,
  //     system,
  //   };
  //   // Remove the type from the dataset since it's in the itemData.type prop.
  //   delete itemData.system["type"];

  //   // Finally, create the item!
  //   return await Item.create(itemData, { parent: this.actor });
  // }

  // async #onItemDelete(event) {
  //   const li = $(event.currentTarget).parents(".item");
  //   const item = this.actor.items.get(li.data("itemId"));

  //   const confirmDelete = await Dialog.confirm({
  //     title: game.i18n.localize("SMT.dialog.confirmDeleteDialogTitle"),
  //     content: `<p>${game.i18n.format("SMT.dialog.confirmDeletePrompt", { name: item.name })}</p>`,
  //     yes: () => true,
  //     no: () => false,
  //     defaultYes: false,
  //   });

  //   if (!confirmDelete) return;

  //   item.delete();
  //   li.slideUp(200, () => this.render(false));
  // }
}

interface SkillRollData {
  itemId?: string;
  tnType?: StatRollTNType;
  accuracyStat?: CharacterStat;
  statValue?: number;
}

interface StatRollFormData {
  tnType: StatRollTNType;
  accuracyStat: CharacterStat;
}
