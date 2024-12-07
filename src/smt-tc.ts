import { preloadHandlebarsTemplates } from "./modules/config/templates.js";
import { CharacterDataModel } from "./modules/data-models/actor/actor-model.js";
import { SkillDataModel } from "./modules/data-models/item/item-model.js";
import { SmtActorSheet } from "./modules/documents/actor/actor-sheet.js";
import { SmtActor } from "./modules/documents/actor/actor.js";
import { SmtItemSheet } from "./modules/documents/item/item-sheet.js";
import { SmtItem } from "./modules/documents/item/item.js";

Hooks.once("init", async () => {
  console.log("SMT | Initializing SMT game system");

  configureDocumentClasses();

  configureDataModels();

  registerSheetApplications();

  await preloadHandlebarsTemplates();
});

function configureDocumentClasses() {
  CONFIG.Actor.documentClass = SmtActor;
  CONFIG.Item.documentClass = SmtItem;
}

function configureDataModels() {
  CONFIG.Item.dataModels.skill = SkillDataModel;
  CONFIG.Actor.dataModels.character = CharacterDataModel;
}

function registerSheetApplications() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("smt-tc", SmtActorSheet, {
    types: ["character"],
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("smt-tc", SmtItemSheet, {
    types: ["skill"],
    makeDefault: true,
  });
}
