export function registerSystemSettings() {
  game.settings.register("smt", "invertShiftBehavior",
    {
      name: "SMT.settings.invertShiftBehavior.name",
      hint: "SMT.settings.invertShiftBehavior.hint",
      scope: "client",
      config: true,
      requiresReload: false,
      type: Boolean,
      default: false,
    }
  )
}