# Shin Megami Tensei: Tokyo Conception (Unofficial)

Unofficial Foundry VTT system for Shin Megami Tensei: Tokyo Conception. **This is a fan project not affiliated with LionWing Publishing or ATLUS. Please do not contact them for support.**

**This system includes no rules compendium. A copy of the rulebook is required to play.** You can get it here: <https://lionwingpublishing.com/collections/shin-megami-tensei-iii-nocturne-the-roleplaying-game-tokyo-conception-core-rulebook>

This is designed with Tokyo Conception in mind, since it's the only iteration of the SMT TRPG I know anything about. It does a lot of things for you, once it's set up to, but doesn't currently give you a ton of levers to control how it does those things. I'm not averse to the idea, I just initially developed this in tandem with a campaign I'm running, so my priority was automation and speed of play; I usually only get about 2 hours per session with my schedule, so I want to make that time count XD

If you're looking for more flexibility, and/or to run an SMT game other than Tokyo Conception, check out Alondaar's SMT X system, which is designed to be more broadly compatible: <https://github.com/Alondaar/smt-200x>

## Forward Compatibility Notice

I'm in the process of rewriting the data model schema to use real item and actor types instead of the horrible kludge I have right now. That means the system actor and item types will be changing, which means there'll be a huge breaking update at some point and I can't guarantee an automatic migration path (I will try though).

## Usage Notes

- Skills are mostly automatic. If you have one or more targets, they'll automatically make Dodge rolls and ailment resist rolls, if applicable. Damage and ailment rates are calculated per target depending on their phys/mag resist and elemental affinities.
  - **Exception**: Targets who null/drain/repel the attack won't try to dodge lest they risk an unnecessary fumble, *unless* the attack has the Pierce quality and they don't repel it.
    - How do they tell in the thick of combat? I don't care, it's better than having to nag players to click a button each time someone attacks them
  - If it doesn't seem to work, make sure you **target** the tokens, don't just select them. By default, hover your mouse over the token and press the `T` key. With the Easy Target mod, you can alt+click. For AOE skills, target **all tokens you wish to affect** (`Shift+T` if you aren't using Easy Target).
  - Phys/Mag Resist, critical hits, critical downgrades, fumbles, elemental affinities, buffs, and most status ailments should be accounted for in the damage/ailment chance calculations. If the chat output says "Foo takes 29 damage", no further calculations should be necessary unless Foo spends FP to mitigate it or there's a bug.
- The +/- 20% TN mod buttons are there because situational TN modifiers tend to come in 20% increments. I started my game a tad lower than the recommended level, so I had a lot of PCs using Aid and Concentrate and this saved a lot of time.
  - In-system, the TN boosts apply to your next success roll and are reset to 0 afterward, because everyone in my group, myself included, constantly forgot to reset them ourselves. You can still take different actions in the interim and hang on to the bonus, per the rules, you'll just have to handle the boost panel manually.
  - Hold shift when you click a skill and you'll get a dialog where you can enter a custom modifier, besides 20%. You can make this the default behavior (per-client) in the system settings, but I almost never need the dialog.
  - The "Multi" setting on the same panel divides all your TNs by the number it's set to for multi-attacking, including any 20% boosts from this panel. You'll probably need that dialog if you're boosting an individual roll within a multi-attack.
- If an item or skill doesn't do what you think it should or go where you want it to go on your sheet, double-check the Skill Type and Item Type fields. Those are what actually determine the "type" of item it is with respect to the game mechanics. The "stackable" and "unstackable" item types literally only denote whether or not the item should be stackable in Item Piles.
  - Yes, it's terrible and I hate it too. It's the biggest reason I'm reworking the data models and also the main reason I think it'll be a pain to migrate afterward

## Macros

GMs check out the macro compendium cause we got us some macros!

- **Resolve Conflict**
  - Prints an end-of-battle summary to chat: the total XP and macca awards of all selected (enemy) tokens and a list of their item drops
- **Award XP/Macca**
  - Awards each selected token a specified amount of XP and macca, displaying the result in chat.
- **Lucky Search**
  - Makes a Luck roll for each selected token that has the Lucky Find skill (i.e. `system.luckyFind` is `true`), and lists the outcomes in chat.
- **Buff Dialog**
  - Show a dialog that lets you apply buffs or debuffs to selected tokens. Also allows you to clear buffs, debuffs, or both.
- **Fountain of Life**
  - Heals selected tokens to full HP and MP, charging 1 macca per HP and 2 macca per MP. Doesn't work on tokens who can't afford it. Doesn't do resurrection or status ailments (yet)

## Data Paths and Active Effects

I recommend using Koboldworks Data Inspector (see below) or the console to uncover data paths, since this system is still under development and they might change. I used active effects to implement passive skills, though, so I want to point out some actor fields that are directly tied to them:

- `system.gunAttackBonus` - Sure Shot
- `system.might` - Might
- `system.dodgeBonus` - Expert Dodge
- `system.luckyFind` - If true, the end-of-battle macro will have this PC make a Lucky Find roll
- `system.powerBoost.phys`, `system.powerBoost.mag`, `system.powerBoost.item` - Powerful Spells, Powerful Strikes, and Item Pro, respectively
- `system.elementBoosts.fire`, `system.elementBoosts.cold`, `system.elementBoosts.elec`, `system.elementBoosts.force` - Fire Boost, Ice Boost, etc.

Open up the skill's item sheet, create a new Active Effect in the Effects tab, and add the appropriate effects. For example, the Expert Dodge skill's effect would have an Attribute Key of `system.dodgeBonus`, a Change Mode of `Add`, and an Effect Value of `5`. For boolean fields, such as everything listed above except `dodgeBonus` and `gunAttackBonus`, use the `Override` mode with `true` as the value.

The system does not currently support overriding elemental affinities with active effects (e.g. Anti-Affinity skills); you'll have to do that manually. It's on the to-do list.

## Recommended Mods

I could recommend a *lot* of mods, but these ones are especially pertinent. I especially can't recommend Item Piles or Mana's Compendium Importer as strongly as they deserve.

- [**Item Piles**](https://github.com/fantasycalendar/FoundryVTT-ItemPiles): *vastly* streamlined inventory management, including shops and storage vaults. *Absolutely indispensable* for games where items change hands often.
  - The system includes its own integration with the module, so it *should* Just Work™️ for the most part. Items are awkwardly coded though so I can't guarantee they won't flip out somehow, back up your stuff regularly
  - Dropping an item *directly* onto an actor sheet duplicates it. This is a fixable problem with the system, not the Item Piles mod.
- [**Mana's Compendium Importer**](https://gitlab.com/mkahvi/fvtt-compendium-importer): Lets you export world compendium packs to JSON format. Back up your actors, items, rolled tables, and other stuff, and import them into your other campaigns or share them with friends!
- [**Status Icon Counters**](https://gitlab.com/woodentavern/status-icon-counters): I use this to track -kaja and -nda stacks.
- [**Token Health**](https://github.com/mclemente/fvtt-token-health): Assign damage or healing to multiple tokens at once.
  - I find myself doing a lot of on-the-fly adjustments when players spend XP, so building damage assignment into the system would be more effort than it's worth imo
  - Use `hp.value` and `hp.max` for the primary health pool, and `mp.value` and `mp.max` for the secondary one.
- [**Easy Target**](https://bitbucket.org/Fyorl/easy-target/src): Alt-click to target things, so you don't have to remember to click outside the chat window first.
- [**Roll of Fate**](https://github.com/Handyfon/roll-of-fate/blob/master/README.md): Randomly picks a token out of those you have selected; useful since small fry attack randomly by default.
- [**Koboldworks Data Inspector**](https://gitlab.com/koboldworks/agnostic/data-inspector): Browse an actor or item's internal data in a nice neat window instead of having to retrieve it with the console.

## Known Issues

- There's no built-in way to spend FP on dodge rolls.
  - I'd like to fix this, but if I'm going to take the time I want to do it right and use sockets or interactive chat output and I need to learn how those work first.
- I'd love it if the sheets had an SMT aesthetic but CSS is not my strong suit
- Combat output is messy and some information is missing (e.g. dodge roll results, if the attack has an ailment chance and deals no damage)
- Skill/item creation is not intuitive
- The system does not distinguish between a regular failure and an autofail, even though the game does
- Focus doesn't go away at the end of your turn if you don't use it for an attack
- Pinhole halves dodge but not phys resist
- Fiends have to manually enter their magatama bonuses (they will be equippable items one day)
- Item Piles support: Dragging items onto character sheets duplicates them
  - **Note!** This issue is with the system, not the mod
- Item Piles support: Gems are as yet unimplemented

CSS stolen from <https://github.com/asacolips-projects/boilerplate>, without which I might never have learned how to Foundry. Kudos!
Also a big shout out to Taragnor and his Persona RPG system, without whom I'd probably still be trying to figure out how to work Typescript in Foundry XD <https://github.com/taragnor/persona>
