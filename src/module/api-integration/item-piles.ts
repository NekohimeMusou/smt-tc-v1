declare global {
  interface Game {
    itempiles: { API: { addSystemIntegration: (a: object) => Promise<void> } };
  }

  interface HOOKS {
    "item-piles-ready": () => Promise<void>;
  }
}

export default function registerModuleAPIs() {
  Hooks.once("item-piles-ready", async () => {
    await game.itempiles.API.addSystemIntegration({
      ACTOR_CLASS_TYPE: "character",
      ITEM_QUANTITY_ATTRIBUTE: "system.qty",
      ITEM_PRICE_ATTRIBUTE: "system.price",
      ITEM_FILTERS: [{ path: "system.itemType", filters: "skill,action" }],
      UNSTACKABLE_ITEM_TYPES: ["unstackable"],
      ITEM_SIMILARITIES: ["name", "type"],
      CURRENCIES: [
        {
          primary: true,
          type: "attribute",
          img: "icons/commodities/currency/coin-yingyang.webp",
          abbreviation: "{#}mc",
          data: { path: "system.macca" },
        },
      ],
    });
  });
}
