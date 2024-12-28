export function configureStatusEffects() {
  CONFIG.statusEffects = CONFIG.statusEffects
    .filter((status) => status.id === "dead")
    .concat(smtStatuses);
}

const smtStatuses = [
  {
    id: "stone",
    name: "SMT.ailments.stone",
    icon: "icons/svg/statue.svg",
  },
  {
    id: "flied",
    name: "SMT.ailments.flied",
    icon: "icons/svg/card-joker.svg",
  },
  {
    id: "stun",
    name: "SMT.ailments.stun",
    icon: "icons/svg/daze.svg",
  },
  {
    id: "charm",
    name: "SMT.ailments.charm",
    icon: "icons/svg/stoned.svg",
  },
  {
    id: "poison",
    name: "SMT.ailments.poison",
    icon: "icons/svg/poison.svg",
  },
  {
    id: "mute",
    name: "SMT.ailments.mute",
    icon: "icons/svg/silenced.svg",
  },
  {
    id: "restrain",
    name: "SMT.ailments.restrain",
    icon: "icons/svg/net.svg",
  },
  {
    id: "freeze",
    name: "SMT.ailments.freeze",
    icon: "icons/svg/frozen.svg",
  },
  {
    id: "sleep",
    name: "SMT.ailments.sleep",
    icon: "icons/svg/sleep.svg",
  },
  {
    id: "panic",
    name: "SMT.ailments.panic",
    icon: "icons/svg/terror.svg",
  },
  {
    id: "shock",
    name: "SMT.ailments.shock",
    icon: "icons/svg/lightning.svg",
  },
  {
    id: "curse",
    name: "SMT.ailments.curse",
    icon: "icons/svg/eye.svg",
  },
  {
    id: "tarukaja",
    name: "SMT.buffSpells.tarukaja",
    icon: "icons/svg/sword.svg",
  },
  {
    id: "rakukaja",
    name: "SMT.buffSpells.rakukaja",
    icon: "icons/svg/shield.svg",
  },
  {
    id: "sukukaja",
    name: "SMT.buffSpells.sukukaja",
    icon: "icons/svg/wingfoot.svg",
  },
  {
    id: "makakaja",
    name: "SMT.buffSpells.makakaja",
    icon: "icons/svg/explosion.svg",
  },
  {
    id: "tarunda",
    name: "SMT.debuffSpells.tarunda",
    icon: "icons/svg/downgrade.svg",
  },
  {
    id: "rakunda",
    name: "SMT.debuffSpells.rakunda",
    icon: "icons/svg/ruins.svg",
  },
  {
    id: "sukunda",
    name: "SMT.debuffSpells.sukunda",
    icon: "icons/svg/trap.svg",
  },
];
