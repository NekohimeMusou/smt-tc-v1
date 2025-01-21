declare class ActiveEffect<A extends Actor<any,I>= any, I extends Item<any, A>=any> extends FoundryDocument<never>  {
	/** returns if effect is active, by default is !disabled && !isSuppressed() */
	get active(): boolean

	statuses: Set<CONFIG["statusEffects"][number]["id"]>
	disabled: boolean;
	/** always returns false by default but can be overloaded*/
	isSuppressed(): boolean;
	parent:A | I;
	origin: Option<unknown>;
	icon: string;
	changes: AEChange[];
	description: string;
	duration: EffectDuration;
	transfer: boolean;
	get isTemporary(): boolean;
}


type EffectDuration = {
	duration: number | null,
	rounds: number | null,
	seconds: number | null,
	startRound: number,
	startTime: number,
	startTurn: number,
	type:"none",
	turns: "none",
	label: "None",
}

type AEChange = {
	key: string; //keys to one of the system values
		mode: (typeof CONST)["ACTIVE_EFFECT_MODES"][keyof (typeof CONST)["ACTIVE_EFFECT_MODES"]];
	priority?: number;
	value: string;
};
