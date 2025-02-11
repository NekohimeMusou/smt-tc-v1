# Shin Megami Tensei: Tokyo Conception (Unofficial)

Unofficial Foundry VTT system for Shin Megami Tensei: Tokyo Conception. **This is a fan project not affiliated with LionWing Publishing or ATLUS. Please do not contact them for support.**

**This system includes no game material compendium, nor is it planned to. A copy of the rulebook is required to play.** You can get it here: <https://lionwingpublishing.com/collections/shin-megami-tensei-iii-nocturne-the-roleplaying-game-tokyo-conception-core-rulebook>

This is my first Typescript project and I wrote it more or less in tandem with a short campaign I've been running, so there's LOTS of jank. This repository is kinda sorta in maintenance mode; I'm in the process of rewriting practically the whole backend, which will in turn help me make the UI less opaque, but it's enough of a rewrite that I'm treating it as a separate project and I'm still using this to run the game while I cook. So, there'll probably be some minor features and bug fixes here and there.

This system is geared specifically toward Tokyo Conception, because it's the only SMT TRPG I own or know anything about how to play XD 

## Usage Notes

- Skills are semi-automatic. If you have one or more targets when you use a skill, assuming you succeed, one power roll will be made (if applicable) and each target will make a dodge roll (if applicable); damage and ailment chance are calculated for each target based on their resists and affinities. Each target automatically makes an ailment roll, if applicable.
  - You must have one or more tokens **targeted** for this to work. By default, you target a token by hovering the mouse over it and pressing the T key; you'll see an animated crosshair over the token if you did it right. Make sure the cursor isn't in the chat box or you'll just type "t" into it. You can hold shift to target multiple tokens. The Easy Target mod lets you alt+click instead.
  - Dodging is automatic because I don't know why you wouldn't try. 
    - Exception: Lest they fumble needlessly, targets who nullify, drain, or repel an attack won't try to dodge *unless* the attack has the Pierce quality and they don't repel it.
- GMs look in the macro compendium because there are some BIG time savers there.
- The +/- 20% TN mod box is there because TN modifiers tend to come in 20% increments. I started my game a tad lower than the recommended level, so I had a lot of PCs using Aid and Concentrate and this saved a lot of time. It resets once you make a roll, because we all kept forgetting to do that.
  - If you need more granularity, hold shift when you click a skill and you'll get a dialog where you can enter a custom modifier. You can make this the default behavior (per-client) in the system settings.
  - All "Multi" does right now is divide your effective TNs by 2 or 3, *including* those 20% bonuses, so it should work pretty seamlessly but you'll probably need that dialog if you're spending FP on individual rolls within a multi-attack. I'm open to suggestions for less awkward ways of doing it!
- There's literally no difference between the "stackable" and "unstackable" item types other than whether they can stack in Item Piles. *Real* item *types* are coming in the rewrite.
- If an item or skill doesn't do what you think it should or go where you want it to go on your sheet, double-check the Skill Type and Item Type fields.
  - I know, I hate it too, it's one of the reasons I'm revamping the data models
- If you're a Fiend, there's a third stat column (besides "Base" and "Lv") for your magatama bonuses, so you can track them separately. They'll be an equippable item eventually so you don't have to type your stats in each time you switch.

## Data Paths

I recommend using Koboldworks Data Inspector (see below) or the console to uncover data paths, especially since this system is still under development and they might change. I used active effects to implement passive skills, though, so I want to point out actor fields that are directly tied to some:

- `system.gunAttackBonus` - Sure Shot
- `system.might` - Might
- `system.dodgeBonus` - Expert Dodge
- `system.luckyFind` - If true, the end-of-battle macro will have this PC make a Lucky Find roll
- `system.powerBoost.phys`, `system.powerBoost.mag`, `system.powerBoost.item` - Powerful Spells, Powerful Strikes, and Item Pro, respectively
- `system.elementBoosts.fire`, `system.elementBoosts.cold`, `system.elementBoosts.elec`, `system.elementBoosts.force` - Fire Boost, Ice Boost, etc.
- `system.resourceBoost.hp`, `system.resourceBoost.mp` - Life and Mana Boost lines

Use the UI to create an active effect on the skill and make sure it's set to transfer to the owner, and the effect will be applied automatically to any actors who own the item. 

## Recommended Mods

I could recommend a *lot* of mods, but these ones are especially pertinent/have saved me loads of time with SMT:TC specifically.

- [**Item Piles**](https://github.com/fantasycalendar/FoundryVTT-ItemPiles): *vastly* streamlined inventory management, including shops and storage vaults. Utterly indispensable for games where items change hands often.
  - The system includes its own integration with the module, so it *should* Just Work™️ for the most part. Items are awkward and brittle though so I can't guarantee they won't flip out somehow, back up your stuff regularly
  - Don't try to trade/transfer items by dropping them *directly* on an actor sheet; it'll duplicate the item. I'm sure this is fixable, I just haven't done it yet.
- [**Status Icon Counters**](https://gitlab.com/woodentavern/status-icon-counters): I use this to track -kaja and -kunda stacks.
- [**Token Health**](https://github.com/mclemente/fvtt-token-health): Deal damage or healing to multiple tokens at once. I've been using this instead of having the system auto-assign damage because I'm lazy.
  - Use `hp.value` and `hp.max` for the primary health pool, and `mp.value` and `mp.max` for the secondary one.
- [**Easy Target**](https://bitbucket.org/Fyorl/easy-target/src): Alt-click to target things, so you don't have to remember to click outside the chat window first.
- [**Health Estimate**](https://github.com/mclemente/healthEstimate/): Give players a rough estimate of an enemy's health without giving away their exact HP bar. I like to cut out the 25% and 75% tiers so all the players know for sure is whether their opponent is+ above or below half HP, but that's a matter of preference.
- [**Party Overview**](https://github.com/mclemente/party-overview): Doesn't support this system natively, but I can provide a patch.
- [**Roll of Fate**](https://github.com/Handyfon/roll-of-fate/blob/master/README.md): Randomly picks a token out of those you have selected; useful since small fry attack randomly by default.
- [**Mana's Compendium Importer**](https://gitlab.com/mkahvi/fvtt-compendium-importer): Lets you back up *world* compendium packs to JSON files and import them in other worlds. Great for keeping backups of your demons and items and reusing them between games.
- [**Koboldworks Data Inspector**](https://gitlab.com/koboldworks/agnostic/data-inspector): Browse an actor or item's internal data in a nice neat window instead of having to retrieve it with the console. 

## Known Issues

- I'd love it if the sheets had an SMT aesthetic but CSS is not my strong suit
- Combat output is kinda messy
- Skill/item creation is not intuitive
- Combat chat cards do not show (numeric) dodge roll result for attacks that inflict status ailments but don't deal damage
- The system does not yet discern between a regular failure and an autofail, even though the game does
- Focus doesn't go away at the end of your turn if you don't use it for an attack

- Item Piles support: Dragging items onto character sheets duplicates them
- Item Piles support: Gems are as yet unimplemented

CSS stolen from <https://github.com/asacolips-projects/boilerplate>, without which I might never have learned how to Foundry. Kudos!
Also a big shout out to Taragnor and his Persona RPG system, without whom I'd probably still be trying to figure out how to work Typescript in Foundry XD <https://github.com/taragnor/persona>
