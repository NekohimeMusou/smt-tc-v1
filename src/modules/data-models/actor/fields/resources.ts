const fields = foundry.data.fields;

export function generateResourceSchema() {
  return {
    max: new fields.NumberField({ integer: true }),
    value: new fields.NumberField({ integer: true }),
  };
}
