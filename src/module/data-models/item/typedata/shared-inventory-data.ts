export function sharedInventoryData() {
  const fields = foundry.data.fields;

  return {
    price: new fields.NumberField({ integer: true, min: 0 }),
    qty: new fields.NumberField({ integer: true, min: 1 }),
  } as const;
}
