import affinitySchema from "../../shared/affinities.js";

export default function magatamaData() {
  const fields = foundry.data.fields;

  return {
    affinities: new fields.SchemaField(affinitySchema()),
  } as const;
}
