type Subtype<T extends (Actor<any, any> | Item<any>), X extends T["system"]["type"]> = T & {system: {get type() : Readonly<X>}};
type SubtypeSys<T extends (Actor<any, any> | Item<any>), X extends T["system"]["type"]> = Subtype<T,X>["system"];

type DataModelSystemData<TDM extends InstanceType<typeof foundry.abstract.TypeDataModel>, ActorOrItem extends Actor<any> | Item<any>> = TDM & SubtypeSys<ActorOrItem, TDM["type"]>;

