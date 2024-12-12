import { SMT } from "./config/config.js";
import { registerSystemSettings } from "./config/settings.js";
import { preloadHandlebarsTemplates } from "./config/templates.js";
import { SmtPcDataModel } from "./data-models/actor/actor-model.js";
import { SkillDataModel } from "./data-models/item/item-model.js";
import { SmtActorSheet } from "./documents/actor/actor-sheet.js";
import { SmtActor } from "./documents/actor/actor.js";
import { SmtItemSheet } from "./documents/item/item-sheet.js";
import { SmtItem } from "./documents/item/item.js";

declare global {
  interface Game {
    smt: {
      SmtActor: typeof SmtActor;
      SmtItem: typeof SmtItem;
    };
  }

  interface CONFIG {
    SMT: typeof SMT;
  }
}

Hooks.once("init", async () => {
  console.log("SMT | Initializing SMT game system");

  CONFIG.SMT = SMT;

  game.smt = {
    SmtActor,
    SmtItem,
  };

  configureDocumentClasses();

  configureDataModels();

  registerSheetApplications();

  registerSystemSettings();

  await preloadHandlebarsTemplates();
});

function configureDocumentClasses() {
  CONFIG.Actor.documentClass = SmtActor;
  CONFIG.Item.documentClass = SmtItem;
}

function configureDataModels() {
  CONFIG.Item.dataModels.skill = SkillDataModel;
  CONFIG.Actor.dataModels.character = SmtPcDataModel;
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
