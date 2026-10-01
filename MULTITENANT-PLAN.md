# Plano de expansão multitenant

## Regra principal

- `/gestao` é a área mestre da plataforma.
- Somente a Gestão cria novos eventos/convites.
- A Gestão pode abrir qualquer evento, acessar o painel operacional e usar o editor visual completo.
- `/admin` é a área do dono do evento.
- Cada conta de dono fica vinculada a um único evento.
- Convidados, RSVP, presentes, reservas, assets e layout são sempre isolados por `event_id`.
- O projeto antigo `paracasamento/tconvido` e o Neon antigo de produção não participam da expansão.

## Estado atual

### Banco
- A base já possui `events`, `admins` e `event_admins`.
- Convidados, presentes, reservas, RSVP e layout já carregam `event_id`.
- `reservations` já possui FKs compostas que impedem relacionar convidado/presente de outro evento.
- `admin_sessions` autentica o usuário, mas não fixa explicitamente o evento da sessão.
- A Gestão hoje é modelada como um `owner` de evento, e não como administrador da plataforma.

### Aplicação
- `EVENT_SLUG` ainda define um evento padrão em partes da entrada pública.
- O login administrativo usa `LIMIT 1` em `event_admins`; se uma conta tiver mais de um evento, o evento escolhido é implícito.
- O login de Gestão também depende de `event_admins.role = 'owner'`.
- O editor já recebe `session.event_id` e é naturalmente compatível com vários eventos quando a seleção de evento for corrigida.
- A maioria dos CRUDs de convidados/presentes já filtra por `session.event_id`.
- Existem links e textos ainda assumindo um único convite, inclusive compartilhamento pela raiz do domínio e branding fixo.

## Estado desejado

### Gestão da plataforma
1. Login de Gestão autentica uma conta de plataforma, sem amarrá-la a um evento.
2. `/gestao` lista todos os eventos.
3. A Gestão cria um evento e, no mesmo fluxo, cria o acesso do dono.
4. A Gestão seleciona um evento ativo para abrir:
   - painel dos noivos;
   - editor visual;
   - preview;
   - ferramentas técnicas.
5. A seleção é validada no servidor.

### Dono do evento
1. Faz login em `/admin`.
2. A sessão fica vinculada a exatamente um `event_id`.
3. Não existe seletor de evento no painel do cliente.
4. Todas as operações continuam filtradas pelo `event_id` da sessão.

### Convite público
1. Cada evento possui slug único.
2. Entrada pública: `/e/[slug]`.
3. O slug resolve o evento antes da autenticação do convidado.
4. Depois do acesso, a sessão assinada carrega o `event_id`.
5. RSVP, presentes e reservas usam o `event_id` da sessão, nunca um ID recebido livremente do navegador.

## Alterações necessárias

### Fase A — código sem migration
- Adicionar resolução de evento por slug.
- Criar `/e/[slug]`.
- Fazer o formulário de acesso enviar o slug.
- Gerar links de compartilhamento com `/e/[slug]`.
- Remover hardcodes de nome do casal na navegação administrativa.
- Revisar queries por `id` e adicionar `event_id` explícito quando aplicável.

### Fase B — autenticação e banco
Migration prevista no Neon novo, e somente nele:
- criar `platform_admins` para separar permissão de plataforma de permissão de evento;
- adicionar escopo/evento a `admin_sessions`, distinguindo sessão de plataforma e sessão de evento;
- revogar sessões antigas na migração para evitar sessões ambíguas;
- criar índices auxiliares de sessão;
- cadastrar a conta atual de Gestão em `platform_admins`.

Código:
- `createPlatformSession` / `getPlatformSession`;
- sessão do cliente criada com `event_id` explícito;
- seleção de evento da Gestão em cookie HttpOnly separado;
- `getAdminSession` do cliente nunca escolhe evento com `LIMIT 1`.

### Fase C — criação e seleção de eventos
- `/gestao`: dashboard de eventos.
- `/gestao/eventos/novo`: formulário de criação.
- criação atômica de:
  - evento;
  - conta do dono;
  - vínculo `event_admins`.
- rejeitar slug duplicado.
- rejeitar e-mail de dono já vinculado a outro evento.
- evento sempre nasce em `draft`.
- botões “Painel”, “Editor” e “Abrir convite”.

### Fase D — isolamento
Auditar todas as operações administrativas e públicas.
Regras:
- qualquer leitura/escrita administrativa usa o evento da sessão;
- IDs de convidado/presente/RSVP são sempre validados junto com `event_id`;
- uploads ficam sob `events/{event_id}/...`;
- a Gestão seleciona evento no servidor antes de abrir editor/painel.

### Fase E — testes
Criar dois eventos fictícios no Neon novo.
Em cada um:
- dono diferente;
- convidados diferentes;
- presentes diferentes;
- RSVP e reservas diferentes;
- layout diferente.

Testes negativos:
- dono A não enxerga dados B;
- API do A não altera ID do B;
- convidado A não reserva presente B;
- cookies de um evento não autorizam outro;
- slug inexistente não revela outro evento;
- Gestão continua podendo entrar nos dois.

## Critério para merge em main

Só integrar `multitenant-foundation` em `main` quando:
- migration tiver sido aplicada somente ao Neon novo;
- dois eventos de teste passarem no isolamento;
- build do Next.js passar;
- preview/deployment da Vercel nova estiver saudável;
- nenhum passo tiver tocado o repositório ou Neon antigos.


## Status de execução — 2026-10-01

Concluído:
- branch isolada `multitenant-foundation`;
- entrada pública por `/e/[slug]`;
- remoção do fallback de evento único por `EVENT_SLUG`;
- sessão de cliente vinculada explicitamente a `event_id`;
- sessão de Gestão separada como conta de plataforma;
- dashboard de eventos em `/gestao`;
- criação de evento + dono + vínculo + design inicial;
- template padrão sem identidade de Pedro & Letícia;
- hardcodes antigos removidos das áreas públicas/cliente;
- queries críticas reforçadas com escopo explícito por evento;
- Neon `tconvido-multitenant` identificado como `shy-cherry-01514927`;
- schema fresh criado no Neon novo;
- `platform_admins` criado e conta mestre cadastrada;
- teste de isolamento entre dois eventos aprovado;
- teste de reserva cruzada bloqueado por FK;
- Neon deixado limpo após os testes: 0 eventos, 0 convidados, 0 presentes e 0 reservas;
- último preview da branch compilando em Vercel com estado READY.

Bloqueio antes do merge:
- o projeto Vercel `tconvido-multitenant` ainda não possui `DATABASE_URL`.
- runtime atual confirma o erro `DATABASE_URL não configurada.`
- configurar a variável apontando exclusivamente para o Neon `shy-cherry-01514927`;
- depois validar runtime, criar dois eventos pelo fluxo real da aplicação e só então integrar a branch em `main`.

- Runtime DB role validated after Vercel environment update.
