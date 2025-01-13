import { SMT } from "./config/config.js";
import { configureStatusEffects } from "./config/statuses.js";
import { ACTORMODELS } from "./data-models/actor/actor-data-model.js";
import { ITEMMODELS } from "./data-models/item/item-data-model.js";
import { SmtActorSheet } from "./documents/actor/actor-sheet.js";
import { SmtActor } from "./documents/actor/actor.js";
import { SmtItemSheet } from "./documents/item/item-sheet.js";
import { SmtItem } from "./documents/item/item.js";
import { createBasicStrike } from "./helpers/hooks.js";

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

  CONFIG.ActiveEffect.legacyTransferral = false;

  CONFIG.SMT = SMT;

  game.smt = {
    SmtActor,
    SmtItem,
  };

  registerDataModels();
  registerDocumentClasses();
  registerSheetApplications();
  registerSystemSettings();
  registerHooks();
  configureStatusEffects();

  await preloadHandlebarsTemplates();
});

function registerDataModels() {
  CONFIG.Item.dataModels = ITEMMODELS;
  CONFIG.Actor.dataModels = ACTORMODELS;
}

function registerDocumentClasses() {
  CONFIG.Actor.documentClass = SmtActor;
  CONFIG.Item.documentClass = SmtItem;
}

function registerSheetApplications() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("smt-tc", SmtActorSheet, {
    types: ["character"],
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("smt-tc", SmtItemSheet, {
    types: ["unstackable", "stackable"],
    makeDefault: true,
  });
}

export function registerSystemSettings() {
  game.settings.register("smt-tc", "invertShiftBehavior", {
    name: "SMT.settings.invertShiftBehavior.name",
    hint: "SMT.settings.invertShiftBehavior.hint",
    scope: "client",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
  });
}

function registerHooks() {
  Hooks.on("createActor", createBasicStrike);
}

async function preloadHandlebarsTemplates() {
  await loadTemplates(SMT.templatePaths);
}