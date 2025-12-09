/*
 Simple Orval transformer that ensures every array schema has an `items` key.
 If missing, we default to string items to satisfy the schema validator.
*/

function ensureArrayItems(schema) {
  if (!schema || typeof schema !== 'object') return;

  if (schema.type === 'array' && schema.items == null) {
    schema.items = { type: 'string' };
  }

  if (schema.properties && typeof schema.properties === 'object') {
    for (const key of Object.keys(schema.properties)) {
      ensureArrayItems(schema.properties[key]);
    }
  }

  if (schema.allOf) schema.allOf.forEach(ensureArrayItems);
  if (schema.anyOf) schema.anyOf.forEach(ensureArrayItems);
  if (schema.oneOf) schema.oneOf.forEach(ensureArrayItems);
  if (schema.items) ensureArrayItems(schema.items);
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    ensureArrayItems(schema.additionalProperties);
  }
}

module.exports = (input) => {
  const spec = typeof input === 'string' ? JSON.parse(input) : input;

  if (spec.components && spec.components.schemas) {
    for (const name of Object.keys(spec.components.schemas)) {
      ensureArrayItems(spec.components.schemas[name]);
    }
  }

  if (spec.paths) {
    for (const pathKey of Object.keys(spec.paths)) {
      const pathItem = spec.paths[pathKey];
      for (const method of Object.keys(pathItem)) {
        const op = pathItem[method];
        if (!op || typeof op !== 'object') continue;
        const params = op.parameters || [];
        params.forEach((p) => ensureArrayItems(p.schema));
        if (op.requestBody && op.requestBody.content) {
          for (const ct of Object.keys(op.requestBody.content)) {
            const media = op.requestBody.content[ct];
            if (media.schema) ensureArrayItems(media.schema);
          }
        }
        if (op.responses) {
          for (const rc of Object.keys(op.responses)) {
            const res = op.responses[rc];
            if (res.content) {
              for (const ct of Object.keys(res.content)) {
                const media = res.content[ct];
                if (media.schema) ensureArrayItems(media.schema);
              }
            }
          }
        }
      }
    }
  }

  return spec;
};
