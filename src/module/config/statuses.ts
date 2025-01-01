export function configureStatusEffects() {
  CONFIG.statusEffects = CONFIG.statusEffects
    .filter((status) => status.id === "dead")
    .concat(smtStatuses);
}

const { ADD, OVERRIDE } = CONST.ACTIVE_EFFECT_MODES;

const smtStatuses = [
  {
    id: "stone",
    name: "SMT.ailments.stone",
    icon: "icons/svg/statue.svg",
    changes: [
      {
        key: "system.stone",
        value: "true",
        mode: OVERRIDE,
      },
    ],
  },
  // TODO: Make sure this changes save/dodge/negotiation TNs accordingly
  {
    id: "flied",
    name: "SMT.ailments.flied",
    icon: "icons/svg/card-joker.svg",
    changes: [
      {
        key: "system.takeDoubleDamage",
        value: "true",
        mode: OVERRIDE,
      },
      {
        key: "system.stats.st.value",
        value: "1",
        mode: OVERRIDE,
      },
      {
        key: "system.stats.ma.value",
        value: "1",
        mode: OVERRIDE,
      },
      {
        key: "system.stats.vi.value",
        value: "1",
        mode: OVERRIDE,
      },
      {
        key: "system.stats.lu.value",
        value: "1",
        mode: OVERRIDE,
      },
    ],
  },
  {
    id: "stun",
    name: "SMT.ailments.stun",
    icon: "icons/svg/daze.svg",
    changes: [
      {
        key: "system.autoFailThreshold",
        value: "25",
        mode: OVERRIDE,
      },
    ],
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
    changes: [
      {
        key: "system.poison",
        value: "true",
        mode: OVERRIDE,
      },
    ],
  },
  {
    id: "mute",
    name: "SMT.ailments.mute",
    icon: "icons/svg/silenced.svg",
    changes: [
      {
        key: "system.mute",
        value: "true",
        mode: OVERRIDE,
      },
    ],
  },
  {
    id: "restrain",
    name: "SMT.ailments.restrain",
    icon: "icons/svg/net.svg",
    changes: [
      {
        key: "system.noActions",
        value: "true",
        mode: OVERRIDE,
      },
      {
        key: "system.physAttacksCrit",
        value: "true",
        mode: OVERRIDE,
      },
    ],
  },
  {
    id: "freeze",
    name: "SMT.ailments.freeze",
    icon: "icons/svg/frozen.svg",
    changes: [
      {
        key: "system.noActions",
        value: "true",
        mode: OVERRIDE,
      },
      {
        key: "system.physAttacksCrit",
        value: "true",
        mode: OVERRIDE,
      },
      {
        key: "system.ignorePhysAffinity",
        value: "true",
        mode: OVERRIDE,
      },
    ],
  },
  {
    id: "sleep",
    name: "SMT.ailments.sleep",
    icon: "icons/svg/sleep.svg",
    changes: [
      {
        key: "system.noActions",
        value: "true",
        mode: OVERRIDE,
      },
    ],
  },
  {
    id: "panic",
    name: "SMT.ailments.panic",
    icon: "icons/svg/terror.svg",
    changes: [
      {
        key: "system.panic",
        value: "true",
        mode: OVERRIDE,
      }
    ]
  },
  {
    id: "shock",
    name: "SMT.ailments.shock",
    icon: "icons/svg/lightning.svg",
    changes: [
      {
        key: "system.noActions",
        value: "true",
        mode: OVERRIDE,
      },
      {
        key: "system.physAttacksCrit",
        value: "true",
        mode: OVERRIDE,
      },
    ],
  },
  {
    id: "curse",
    name: "SMT.ailments.curse",
    icon: "icons/svg/eye.svg",
    changes: [
      {
        key: "system.autoFailThreshold",
        value: "86",
        mode: OVERRIDE,
      },
      {
        key: "system.curse",
        value: "true",
        mode: OVERRIDE,
      },
    ],
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
  {
    id: "defending",
    name: "SMT.characterMods.defending",
    icon: "icons/svg/combat.svg",
    changes: [
      {
        key: "system.tn.dodge",
        value: "20",
        mode: ADD,
      },
      {
        key: "system.stats.ag.specialTN",
        value: "20",
        mode: ADD,
      },
    ],
  },
  {
    id: "focused",
    name: "SMT.characterMods.focused",
    icon: "icons/svg/aura.svg",
    changes: [
      {
        key: "system.focused",
        value: "true",
        mode: OVERRIDE,
      },
    ]
  }
];
