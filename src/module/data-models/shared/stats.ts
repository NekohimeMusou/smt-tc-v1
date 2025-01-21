export default function statData() {
  const fields = foundry.data.fields;

  return {
    st: new fields.SchemaField(generateStatSchema()),
    ma: new fields.SchemaField(generateStatSchema()),
    vi: new fields.SchemaField(generateStatSchema()),
    ag: new fields.SchemaField(generateStatSchema()),
    lu: new fields.SchemaField(generateStatSchema()),
  } as const;
}

function generateStatSchema() {
  const fields = foundry.data.fields;

  return {
    base: new fields.NumberField({ integer: true, initial: 1 }),
    magatama: new fields.NumberField({ integer: true }),
    lv: new fields.NumberField({ integer: true }),
    value: new fields.NumberField({ integer: true }),
  };
}
