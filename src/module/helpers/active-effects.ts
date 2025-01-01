import { SmtActor } from "../documents/actor/actor.js";
import { SmtItem } from "../documents/item/item.js";

/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export async function onManageActiveEffect(
  event: JQuery.ClickEvent,
  owner: SmtActor | SmtItem,
) {
  event.preventDefault();
  const a = $(event.currentTarget);
  const li = a.closest("li");
  const effect = owner.effects.get(li.data("effectId") as string);
  // const effect = (li.data("effectId"))
  //   ? owner.effects.get(li.data("effectId"))
  //   : null;
  const actor = owner instanceof SmtActor ? owner : (owner.parent as SmtActor);
  switch (a.data("action")) {
    case "create":
      return await owner.createEmbeddedDocuments("ActiveEffect", [
        {
          name: game.i18n.localize("MWDESTINY.effects.newEffect"),
          icon: "icons/svg/aura.svg",
          origin: owner.uuid,
          duration: {
            rounds: li.data("effectType") === "temporary" ? 1 : undefined,
          },
          disabled: li.data("effectType") === "inactive",
        },
      ]);
    case "edit":
      return await effect.sheet.render(true);
    case "delete":
      await owner.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
      if (actor) await actor.sheet.render(false);
      return;
    case "toggle":
      await owner.updateEmbeddedDocuments("ActiveEffect", [
        { _id: effect._id, disabled: !effect.disabled },
      ]);
      if (actor) await actor.sheet.render(false);
      return;
  }
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(
  effects: ActiveEffect<SmtActor, SmtItem>[],
) {
  // Define effect header categories
  const categories: AECategories = {
    temporary: {
      type: "temporary",
      label: game.i18n.localize("MWDESTINY.effects.temporary"),
      effects: [],
    },
    passive: {
      type: "passive",
      label: game.i18n.localize("MWDESTINY.effects.passive"),
      effects: [],
    },
    inactive: {
      type: "inactive",
      label: game.i18n.localize("MWDESTINY.effects.inactive"),
      effects: [],
    },
  };

  // Iterate over active effects, classifying them into categories
  for (const e of effects) {
    if (e.disabled) categories.inactive.effects.push(e);
    else if (e.isTemporary) categories.temporary.effects.push(e);
    else categories.passive.effects.push(e);
  }
  return categories;
}

interface AECategory {
  type: "temporary" | "passive" | "inactive";
  label: string;
  effects: ActiveEffect<SmtActor, SmtItem>[];
}

interface AECategories {
  temporary: AECategory;
  passive: AECategory;
  inactive: AECategory;
}