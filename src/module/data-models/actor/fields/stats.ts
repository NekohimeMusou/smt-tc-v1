const fields = foundry.data.fields;

export function generateStatSchema() {
  return {
    base: new fields.NumberField({ integer: true, initial: 1 }),
    magatama: new fields.NumberField({ integer: true }),
    lv: new fields.NumberField({ integer: true }),
    value: new fields.NumberField({ integer: true }),
    tn: new fields.NumberField({ integer: true }),
    specialTN: new fields.NumberField({ integer: true }),
  };
}
