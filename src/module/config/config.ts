import { showAwardDialog, showBuffDialog } from "../helpers/macro.js";

declare global {
  type Affinity = keyof typeof affinities;
  type Ailment = keyof typeof ailments;
  type PowerBoostType = keyof typeof powerBoostTypes;
  type CostType = keyof typeof costTypes;
  type AffinityLevel = keyof typeof affinityLevels;
  type DamageType = keyof typeof damageTypes;
  type TargetNumber = keyof typeof tnNames;
}

const templatePaths = [
  "systems/smt-tc/templates/parts/actor/header.hbs",
  "systems/smt-tc/templates/parts/actor/tab-main.hbs",
  "systems/smt-tc/templates/parts/actor/tab-inventory.hbs",
  "systems/smt-tc/templates/parts/actor/resources.hbs",
  "systems/smt-tc/templates/parts/actor/stats.hbs",
  "systems/smt-tc/templates/parts/actor/derived-stats.hbs",
  "systems/smt-tc/templates/parts/actor/weapons.hbs",
  "systems/smt-tc/templates/parts/actor/skills.hbs",
  "systems/smt-tc/templates/parts/item/header.hbs",
  "systems/smt-tc/templates/parts/item/skill/tab-main.hbs",
  "systems/smt-tc/templates/parts/item/attack.hbs",
  "systems/smt-tc/templates/parts/item/equipment.hbs",
  "systems/smt-tc/templates/parts/actor/affinities.hbs",
  "systems/smt-tc/templates/parts/actor/dice-modifiers.hbs",
  "systems/smt-tc/templates/parts/actor/buffs.hbs",
  "systems/smt-tc/templates/parts/actor/equipment.hbs",
  "systems/smt-tc/templates/parts/actor/items.hbs",
  "systems/smt-tc/templates/parts/shared/tab-effects.hbs",
  "systems/smt-tc/templates/parts/chat/target-roll.hbs",
] as const;

const itemTypes = {
  item: "SMT.itemTypes.item",
  weapon: "SMT.itemTypes.weapon",
  gun: "SMT.itemTypes.gun",
  armor: "SMT.itemTypes.armor",
  magatama: "SMT.itemTypes.magatama",
  card: "SMT.itemTypes.card",
  skill: "SMT.itemTypes.skill",
} as const;

const armorSlots = {
  head: "SMT.armorSlots.head",
  torso: "SMT.armorSlots.torso",
  legs: "SMT.armorSlots.legs",
  none: "SMT.armorSlots.none",
} as const;

const charClasses = {
  human: "SMT.charClasses.human",
  fiend: "SMT.charClasses.fiend",
  demon: "SMT.charClasses.demon",
} as const;

const damageTypes = {
  phys: "SMT.powerTypes.phys",
  mag: "SMT.powerTypes.mag",
} as const;

const powerBoostTypes = {
  phys: "SMT.powerTypes.phys",
  mag: "SMT.powerTypes.mag",
  item: "SMT.powerTypes.item",
} as const;

const costTypes = {
  hp: "SMT.resources.HP",
  mp: "SMT.resources.MP",
} as const;

const affinities = {
  phys: "SMT.affinities.phys",
  fire: "SMT.affinities.fire",
  cold: "SMT.affinities.cold",
  elec: "SMT.affinities.elec",
  force: "SMT.affinities.force",
  light: "SMT.affinities.light",
  dark: "SMT.affinities.dark",
  mind: "SMT.affinities.mind",
  nerve: "SMT.affinities.nerve",
  ruin: "SMT.affinities.ruin",
  almighty: "SMT.affinities.almighty",
  ailment: "SMT.affinities.ailment",
  healing: "SMT.affinities.healing",
  support: "SMT.affinities.support",
  unique: "SMT.affinities.unique",
  talk: "SMT.affinities.talk",
  none: "SMT.affinities.none",
} as const;

const affinityLevels = {
  reflect: "SMT.affinityLevels.reflect",
  drain: "SMT.affinityLevels.drain",
  null: "SMT.affinityLevels.null",
  resist: "SMT.affinityLevels.resist",
  weak: "SMT.affinityLevels.weak",
  none: "SMT.affinityLevels.none",
} as const;

const ailments = {
  none: "SMT.ailments.none",
  stone: "SMT.ailments.stone",
  flied: "SMT.ailments.flied",
  stun: "SMT.ailments.stun",
  charm: "SMT.ailments.charm",
  poison: "SMT.ailments.poison",
  mute: "SMT.ailments.mute",
  restrain: "SMT.ailments.restrain",
  freeze: "SMT.ailments.freeze",
  sleep: "SMT.ailments.sleep",
  panic: "SMT.ailments.panic",
  shock: "SMT.ailments.shock",
  curse: "SMT.ailments.curse",
  instantKill: "SMT.ailments.instantKill",
  instantKillStone: "SMT.ailments.instantKillStone",
} as const;

const inheritanceTraits = {
  mouth: "SMT.inheritanceTraits.mouth",
  eye: "SMT.inheritanceTraits.eye",
  lunge: "SMT.inheritanceTraits.lunge",
  weapon: "SMT.inheritanceTraits.weapon",
  claw: "SMT.inheritanceTraits.claw",
  teeth: "SMT.inheritanceTraits.teeth",
  none: "SMT.inheritanceTraits.none",
} as const;

const skillTypes = {
  phys: "SMT.skillTypes.phys",
  mag: "SMT.skillTypes.mag",
  gun: "SMT.skillTypes.gun",
  spell: "SMT.skillTypes.spell",
  passive: "SMT.skillTypes.passive",
  talk: "SMT.skillTypes.talk",
  item: "SMT.skillTypes.item",
  // For "passive" skills with conditional rolls attached, like Lucky Find and Good Instincts
  other: "SMT.skillTypes.other",
} as const;

const targets = {
  one: "SMT.target.one",
  all: "SMT.target.all",
  allCombatants: "SMT.target.allCombatants",
  self: "SMT.target.self",
} as const;

const derivedTNStats = {
  st: "physAtk",
  ma: "magAtk",
  vi: "save",
  ag: "dodge",
  lu: "negotiation",
} as const;

const tnNames = {
  st: "SMT.tnNames.st",
  ma: "SMT.tnNames.ma",
  vi: "SMT.tnNames.vi",
  ag: "SMT.tnNames.ag",
  lu: "SMT.tnNames.lu",
  physAtk: "SMT.tnNames.physAtk",
  magAtk: "SMT.tnNames.magAtk",
  save: "SMT.tnNames.save",
  dodge: "SMT.tnNames.dodge",
  negotiation: "SMT.tnNames.negotiation",
} as const;

const statusIds = {
  dead: "SMT.ailments.dead",
  stone: "SMT.ailments.stone",
  flied: "SMT.ailments.flied",
  stun: "SMT.ailments.stun",
  charm: "SMT.ailments.charm",
  poison: "SMT.ailments.poison",
  mute: "SMT.ailments.mute",
  restrain: "SMT.ailments.restrain",
  freeze: "SMT.ailments.freeze",
  sleep: "SMT.ailments.sleep",
  panic: "SMT.ailments.panic",
  shock: "SMT.ailments.shock",
  curse: "SMT.ailments.curse",
  tarukaja: "SMT.buffSpells.tarukaja",
  rakukaja: "SMT.buffSpells.rakukaja",
  sukukaja: "SMT.buffSpells.sukukaja",
  makakaja: "SMT.buffSpells.makakaja",
  tarunda: "SMT.debuffSpells.tarunda",
  rakunda: "SMT.debuffSpells.rakunda",
  sukunda: "SMT.debuffSpells.sukunda",
  defending: "SMT.characterMods.defending",
  focused: "SMT.characterMods.focused",
} as const;

export const SMT = {
  charClasses,
  damageTypes,
  powerBoostTypes,
  affinities,
  affinityLevels,
  ailments,
  inheritanceTraits,
  skillTypes,
  costTypes,
  targets,
  itemTypes,
  templatePaths,
  derivedTNStats,
  armorSlots,
  statusIds,
  tnNames,
  defaultAutofailThreshold: 96,
  showBuffDialog,
  showAwardDialog,
} as const;
