# Shin Megami Tensei RPG (Unofficial)

Unofficial Foundry VTT system for Shin Megami Tensei: Tokyo Conception. This is a fan project and not affiliated with ATLUS or LionWing Publishing. A copy of the rules is required to play: <https://lionwingpublishing.com/collections/shin-megami-tensei-iii-nocturne-the-roleplaying-game-tokyo-conception-core-rulebook>

I kludged this together in tandem with my first mini-campaign, so it's a huge mess. I'm working on a full rewrite, hence the "v1", but I thought I'd release this since it's *way* better than nothing.

## Usage Notes

- If you have any tokens *targeted* when you use a skill/item/whatever, a dodge roll will be made for each target and damage will be calculated for anyone who didn't dodge. Elemental affinities, resists, and critical hit effects should all apply ~~unless there's bugs~~.
  - Your targets must be **targeted**, not **selected**. For AOEs, just select more than one target using shift+T or the Easy Target mod.
- The +/- 20% TN mod box is there because TN modifiers tend to come in 20% increments, and I started my game at the low end of the level curve and my players were using Aid and Concentrate a lot.
  - If you need more granularity, hold shift when you click a skill and you'll get a dialog where you can enter a custom modifier.
- "Multi" is a kludge that just divides (most of) your TNs by 2 or 3. You might have to use the manual TN mod dialog if you're doing Fate Point stuff with it.
- There's literally no difference between the "stackable" and "unstackable" item types other than whether they can stack in Item Piles. Actual different *item types* are coming in the rewrite.

## Recommended Mods

I can recommend a *lot* of mods, but these ones are especially pertinent and/or have saved me loads of time.

- Item Piles: **vastly** streamlined inventory management, including shops and storage vaults. Indispensable, imo.
  - Don't try to trade/transfer items by dropping them on an actor sheet; it'll duplicate the item. On my list to fix.
  - It's probably possible to implement the gems as secondary currencies, but the system doesn't do it automatically *yet*.
- Status Icon Counters: I use this to track -kaja and -kunda stacks.
- Token Health: Deal damage or healing to multiple tokens at once.
  - Use `hp.value` and `hp.max` for the primary health pool, and `mp.value` and `mp.max` for the secondary one.
- Easy Target: Alt-click to target things, so you don't have to remember to click outside the chat window first.
- Health Estimate: Give PCs a rough estimate of an enemy's health without giving away their exact HP bar.
  - For SMT I generally delete the 25% and 75% tiers and leave the 50% one, so the players know whether the enemy is below half health (and likely to change tactics) but don't have complete information.
- Party Overview: Lets players see everyone's HP/MP/FP; saves time on "what HP you at?"
  - The mod doesn't actually support this system (yet), but I have a patch I intend to submit once I think SMT is ready for prime time.
  - REMEMBER TO INCLUDE IT
- Roll of Fate: Randomly picks a token out of those you have selected; useful since small fry attack randomly.

## Known Issues

- Ugly as hell
  - I promise learning CSS is on my agenda, I just want this thing to function first
- Skill/item creation is ludicrously unintuitive
- Combat chat cards do not show (numeric) dodge roll result for attacks that inflict status ailments but don't deal damage
- The system does not yet discern between a regular failure and an autofail, even though the game does
-
- Item Piles support: Dragging items onto character sheets duplicates them
- Item Piles support: Gems are (as yet) unimplemented
