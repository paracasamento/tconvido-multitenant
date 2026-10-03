import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL("../" + path, import.meta.url), "utf8");
}

const legacyEditor = await source("src/app/admin/editor/page.tsx");
assert.equal(
  legacyEditor.includes("InviteVisualBuilder"),
  false,
  "O painel do cliente não pode renderizar o editor visual."
);
assert.ok(
  legacyEditor.includes('redirect("/admin")'),
  "Cliente autenticado deve voltar ao painel operacional ao tentar abrir /admin/editor."
);

const visualApi = await source("src/app/api/admin/invite-design/route.ts");
assert.ok(
  visualApi.includes("getOwnerSession"),
  "A API de design visual deve exigir a sessão da Gestão."
);
assert.equal(
  visualApi.includes("getAdminSession"),
  false,
  "A API de design visual não pode aceitar a sessão operacional do cliente."
);

for (const path of [
  "src/app/api/me/rsvp/route.ts",
  "src/app/api/me/rsvp/match/route.ts",
]) {
  const text = await source(path);
  assert.ok(
    text.includes("eventHasCapability") && text.includes('"rsvp"'),
    `${path} deve validar a capability rsvp.`
  );
}

for (const path of [
  "src/app/api/gifts/[id]/reserve/route.ts",
  "src/app/api/me/reservation/route.ts",
  "src/app/api/admin/gifts/route.ts",
  "src/app/api/admin/gifts/[id]/route.ts",
  "src/app/api/admin/gift-preferences/route.ts",
]) {
  const text = await source(path);
  assert.ok(
    text.includes("eventHasCapability") && text.includes('"gifts"'),
    `${path} deve validar a capability gifts.`
  );
}

for (const path of [
  "src/app/admin/presentes/page.tsx",
  "src/app/admin/presentes/confirmacoes/page.tsx",
  "src/app/admin/preparar/presentes/page.tsx",
  "src/app/presentes/page.tsx",
  "src/app/meu-presente/page.tsx",
]) {
  const text = await source(path);
  assert.ok(
    text.includes("eventHasCapability") && text.includes('"gifts"'),
    `${path} deve bloquear a interface de presentes quando gifts estiver desabilitado.`
  );
}

console.log("Security/capability invariants OK");
