# Website Psi-Grace

## Identificação
* **Entidade:** Website institucional da Psicóloga Grace Azevedo da Graça
* **Atividade:** Psicologia Clínica
* **Cédula Profissional OPP:** 25999 (Ordem dos Psicólogos Portugueses)
* **Certificação:** EuroPsy
* **Localização do Gabinete:** Ovar, Aveiro, Portugal

---

## Objetivo do Projeto
O projeto disponibiliza uma plataforma web institucional profissional, acolhedora e segura para a clínica da psicóloga Grace Azevedo da Graça. Tem como objetivos centrais a apresentação da sua abordagem clínica, áreas de atuação e espaço de consulta, a disponibilização de contacto direto via WhatsApp, e um sistema completo de pedidos de marcação de consultas online com painel de gestão administrativa e conformidade integral com o Regulamento Geral sobre a Proteção de Dados (RGPD).

---

## Stack Tecnológica Oficial
A stack do projeto é estritamente composta por:
* **Framework:** Next.js 16.3.8 (App Router, Turbopack, Server Actions)
* **Biblioteca UI:** React 19.2.8
* **Linguagem:** TypeScript 5
* **Estilos:** Tailwind CSS v4
* **Backend & Base de Dados:** Supabase
  * PostgreSQL (com tabelas dedicadas para marcações e disponibilidade)
  * Supabase Auth (autenticação segura para a área administrativa)
  * Row Level Security (RLS) & Hardening de privilégios de tabelas
* **Provedor de E-mail Transacional:** Resend (com SDK oficial e templates HTML em PT-PT)
* **Gestor de Pacotes:** npm (com lockfile consistente `package-lock.json`)

---

## Funcionalidades Implementadas

* **Website Institucional:**
  * Apresentação da profissional, formação e abordagem clínica (Sistémica e TCC).
  * Áreas de intervenção e especialidades (adultos, casais, famílias, crianças e adolescentes).
  * Galeria com fotografias reais da clínica, sala de consulta, espaço infantil e fachada.
  * Seção de localização com endereço físico em Ovar e integração de mapa.
  * Perguntas Frequentes (FAQ) interativas com esclarecimentos práticos.
  * Contacto direto e botão flutuante de WhatsApp.

* **Sistema de Marcações Online:**
  * Modalidades disponíveis: Consulta Presencial (no gabinete em Ovar) e Consulta Online (videochamada via WhatsApp).
  * Slots de consulta padronizados com duração de 1 hora.
  * Seleção dinâmica de datas com calendário mensal e verificação de disponibilidade em tempo real.
  * Validações de formulário server-side e prevenção rigorosa de conflitos de horário.

* **Painel Administrativo:**
  * Rotas protegidas `/admin` e `/admin/login`.
  * Autenticação via Supabase Auth com proteção por Next.js Middleware e verificação de privilégios server-side.
  * Gestão de consultas (visualização detalhada, confirmação, cancelamento e registo de notas).
  * Gestão de disponibilidade e bloqueio de datas/horários (`date_overrides`).

* **Notificações por E-mail:**
  * Disparo automático de e-mails transacionais via Resend após criação, confirmação ou cancelamento de marcações.
  * Templates em HTML responsivo no padrão estético da clínica para o utente e para a psicóloga.

* **Privacidade e RGPD:**
  * Página institucional dedicada `/privacidade` detalhando o tratamento e proteção de dados.
  * Consentimento prévio obrigatório no formulário de marcação com registo imutável de data/hora e versão da política.
  * Alerta de privacidade orientando os utentes a não partilharem detalhes clínicos sensíveis no pedido de marcação.

* **SEO & Acessibilidade:**
  * Metadados canónicos, `sitemap.xml` dinâmico e `robots.ts` com proteção explícita que impede indexação de `/admin` e `/admin/`.
  * Associação semântica completa de `htmlFor` e `id` nos campos do formulário para navegação assistiva.

---

## Regras de Agendamento
O sistema de agendamento opera sob regras estritas validadas no servidor:
* **Duração:** Consultas com duração padrão de 60 minutos (slots em horas certas autorizadas).
* **Fuso Horário:** Todas as operações, verificações de passado/futuro e agendamentos operam no timezone oficial `Europe/Lisbon`.
* **Modalidades:** Suporte a consultas presenciais e consultas online.
* **Prevenção de Conflitos:** Validação atómica na base de dados impedindo marcações concorrentes no mesmo dia e horário.
* **Bloqueios e Exceções:** Prioridade de regras de bloqueio diário ou horário configuradas via painel de administração (`availability_schedules`).
* **Validações Server-side:** Sanitização rigorosa de nome, e-mail (RFC 5322), telefone/WhatsApp e limitação de notas opcionais.
* **Consentimento:** O registo da consulta exige obrigatoriamente `consent_given === true`.

---

## Painel Administrativo
O acesso à gestão de consultas situa-se em:
* `/admin/login` — Autenticação de credenciais administrativas via Supabase Auth.
* `/admin` — Painel de controlo principal.

**Segurança:**
* Protegido por Next.js Middleware (redirecionando utilizadores anónimos).
* Verificação server-side da sessão do utilizador com correspondência à variável `ADMIN_EMAIL`.
* Políticas de RLS reforçadas na base de dados (tabelas com permissões restritas e service role isolado no servidor).

---

## Notificações por E-mail (Resend)
* **Integração:** Realizada através do pacote `resend` em ambiente estritamente server-side (`lib/notifications/`).
* **Templates:** Ficheiro `lib/notifications/templates.ts` em Português de Portugal (PT-PT) com detalhes da marcação, morada ou instruções para videochamada, e aviso legal de privacidade.
* **Estado Atual de Envio:**
  * O sistema suporta o ambiente de desenvolvimento e produção através de `RESEND_API_KEY` e `RESEND_FROM_EMAIL`.
  * Em ambiente de teste/onboarding, pode ser utilizado o remetente padrão de testes do Resend (`onboarding@resend.dev`) para os e-mails da conta registada.
  * Para produção, deve ser configurado o domínio próprio verificado no dashboard do Resend (ex.: `notificacoes@grcpsi.pt`).

---

## Privacidade e RGPD
Em conformidade com o Regulamento Geral sobre a Proteção de Dados (Regulamento UE 2016/679):
* **Página de Política:** Disponível em `/privacidade`, acessível em todo o site e no formulário de marcação.
* **Registo de Consentimento:** Na criação de marcações, são guardados na base de dados:
  * `consent_given`: `true`
  * `consent_timestamp`: Timestamp ISO UTC do momento da submissão
  * `consent_version`: Versão da política vigente (ex.: `2026-10-01`)
* **Minimização de Dados:** Coleta estritamente limitada aos dados de contacto necessários para gerir a consulta.
* **Aviso Clínico:** Alerta visível no formulário instruindo o utente a não inserir dados de saúde mental ou diagnóstico no campo de observações.

---

## Desenvolvimento Local

### 1. Instalação de Dependências
```bash
npm install
```

### 2. Variáveis de Ambiente
Copie o ficheiro de exemplo e configure os valores necessários no seu `.env.local`:
```bash
cp .env.example .env.local
```
*(Consulte `.env.example` para a lista completa de variáveis: Supabase, Resend e URL canónica).*

### 3. Execução em Desenvolvimento
```bash
npm run dev
```
Aceda a `http://localhost:3000`.

### 4. Validação e Qualidade de Código
Antes de submeter alterações, execute a suite completa de validação:
```bash
npm run build      # Valida compilação de produção e Turbopack
npm run lint       # Executa o linter ESLint
npx tsc --noEmit   # Valida tipagem estrita do TypeScript
```

---

## Workflow de Desenvolvimento
O projeto adota uma metodologia rigorosa de ciclo de entrega por etapas:
```text
IMPLEMENTAR → VALIDAR → REVISAR → APROVAR → COMMIT → PRÓXIMA FASE
```
* Não efetuar commits automáticos sem aprovação de diff.
* Não efetuar push ou deploy sem autorização explícita.
* Nunca alterar ou commitar ficheiros `.env.local` ou credenciais ativas.

---

## Boas Práticas de Segurança
* **Ficheiros de Ambiente:** `.env.local` está no `.gitignore` e nunca deve ser commitado no repositório.
* **Chaves de Serviço:** A `SUPABASE_SERVICE_ROLE_KEY` e a `RESEND_API_KEY` são server-only e nunca devem ser importadas em componentes de cliente nem expostas no bundle do browser.
* **Base de Dados:** Proibida a execução de comandos ad-hoc de mutação (`INSERT`, `UPDATE`, `DELETE`) em ambiente de produção sem aprovação.
* **Deploy:** Todos os deploys de produção devem passar pelas fases formais de validação.

---

## Estado do Projeto

* **Fase:** Phase 9 — Production Readiness
* **Status:** Em andamento

### Subfases da Phase 9:
* [x] **9.1** Auditoria de Production Readiness *(Concluída)*
* [x] **9.2** Segurança & Correções Técnicas *(Concluída)*
* [x] **9.3** SEO & Acessibilidade *(Concluída)*
* [x] **9.4** Documentação & Alinhamento *(Em execução)*
* [ ] **9.5** Preparação para Deploy *(Pendente)*
* [ ] **9.6** Validação Final Pré-Lançamento *(Pendente)*
