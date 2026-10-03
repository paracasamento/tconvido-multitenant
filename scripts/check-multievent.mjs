import assert from "node:assert/strict";
import {
  EVENT_CAPABILITIES,
  EVENT_TYPES,
  EVENT_TYPE_DEFINITIONS,
  getDefaultCapabilities,
  isEventType,
} from "../src/lib/event-types.ts";

const expectedTypes = [
  "wedding",
  "kids_birthday",
  "quinceanera",
  "baby_shower",
  "housewarming",
];

assert.deepEqual([...EVENT_TYPES], expectedTypes, "A V1 deve permanecer limitada aos cinco tipos aprovados.");

const validCapabilities = new Set(EVENT_CAPABILITIES);

for (const type of EVENT_TYPES) {
  assert.equal(isEventType(type), true, `${type} deve ser reconhecido como EventType.`);

  const definition = EVENT_TYPE_DEFINITIONS[type];
  assert.equal(definition.type, type);
  assert.ok(definition.label.trim().length > 0, `${type} precisa de label.`);
  assert.ok(definition.identityLabel.trim().length > 0, `${type} precisa de identidade.`);

  const defaults = getDefaultCapabilities(type);
  const optional = definition.optionalCapabilities;

  assert.ok(defaults.includes("rsvp"), `${type} deve ter RSVP por padrão.`);

  for (const capability of [...defaults, ...optional]) {
    assert.ok(
      validCapabilities.has(capability),
      `${type} possui capability desconhecida: ${capability}`
    );
  }

  assert.equal(
    new Set(defaults).size,
    defaults.length,
    `${type} não pode repetir capabilities padrão.`
  );
  assert.equal(
    new Set(optional).size,
    optional.length,
    `${type} não pode repetir capabilities opcionais.`
  );

  for (const capability of defaults) {
    assert.equal(
      optional.includes(capability),
      false,
      `${type}: ${capability} não pode ser padrão e opcional ao mesmo tempo.`
    );
  }
}

assert.equal(
  EVENT_TYPE_DEFINITIONS.baby_shower.defaultCapabilities.includes("gifts"),
  true,
  "Chá de bebê deve manter presentes por padrão."
);
assert.equal(
  EVENT_TYPE_DEFINITIONS.housewarming.defaultCapabilities.includes("gifts"),
  true,
  "Casa nova deve manter presentes por padrão."
);
assert.equal(
  EVENT_TYPE_DEFINITIONS.wedding.defaultCapabilities.includes("gifts"),
  false,
  "Casamento não deve obrigar lista de presentes."
);
assert.equal(
  EVENT_TYPE_DEFINITIONS.wedding.optionalCapabilities.includes("gifts"),
  true,
  "Casamento deve permitir lista de presentes opcional."
);

console.log("Multievent matrix OK:", EVENT_TYPES.join(", "));
