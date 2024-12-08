export async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/smt-tc/templates/parts/actor/header.hbs",
    "systems/smt-tc/templates/parts/actor/tab-main.hbs",
    "systems/smt-tc/templates/parts/actor/resources.hbs",
    "systems/smt-tc/templates/parts/actor/stats.hbs",
    "systems/smt-tc/templates/parts/actor/derived-stats.hbs",
  ];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await loadTemplates(templatePaths);
}
