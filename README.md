# Website Psi-Grace

## Identificação
* **Entidade:** Website institucional da Psicóloga Grace Azevedo da Graça
* **Atividade:** Psicologia Clínica
* **Cédula Profissional OPP:** 25999 (Ordem dos Psicólogos Portugueses)
* **Certificação:** EuroPsy
* **Localização do Gabinete:** Ovar, Aveiro, Portugal
* **Website Oficial:** https://grcpsi.pt | https://www.grcpsi.pt

---

## Objetivo do Projeto
O projeto disponibiliza uma plataforma web institucional profissional, acolhedora e segura para a clínica da psicóloga Grace Azevedo da Graça. Tem como objetivos centrais a apresentação da sua abordagem clínica, áreas de atuação e espaço de consulta, a disponibilização de contacto direto via WhatsApp, e um sistema completo de pedidos de marcação de consultas online com painel de gestão administrativa e conformidade integral com o Regulamento Geral sobre a Proteção de Dados (RGPD).

---

## Stack Tecnológica Oficial
A stack do projeto é estritamente composta por:
* **Framework:** Next.js 16.4.6 (App Router, Turbopack, Server Actions)
* **Biblioteca UI:** React 19.2.8
* **Linguagem:** TypeScript 5
* **Estilos:** Tailwind CSS v4
* **Backend & Base de Dados:** Supabase
  * PostgreSQL (com tabelas dedicadas para marcações, disponibilidade, administradores e rate limiting distribuído)
  * Supabase Auth (autenticação segura para a área administrativa)
  * Row Level Security (RLS), funções `SECURITY DEFINER` com `search_path` estrito & Hardening de privilégios de tabelas (princípio do menor privilégio)
* **Provedor de E-mail Transacional:** Resend (com SDK oficial, prevenção de header injection, escaping HTML e templates responsivos em PT-PT)
* **Gestor de Pacotes:** npm (com lockfile consistente `package-lock.json`)

---

## Arquitetura do Sistema
O projeto segue uma arquitetura full-stack moderna baseada no **Next.js App Router** com separação estrita entre cliente e servidor (`import "server-only"`):

```text
├── app/
│   ├── admin/             # Painel administrativo (/admin e /admin/login) protegido por Middleware e RLS
│   ├── booking/           # Server Actions de agendamento, validação, rate limiting e persistência
│   ├── privacidade/       # Política de Privacidade institucional e conformidade RGPD
│   ├── layout.tsx         # Layout raiz, metadados SEO, Open Graph e tipografia
│   ├── page.tsx           # Homepage institucional e fluxo de marcação integrado
│   ├── robots.ts          # Regras de indexação (com bloqueio explícito de /admin)
│   └── sitemap.ts         # Sitemap XML dinâmico
├── components/
│   ├── admin/             # Gestão de consultas, horários semanais e bloqueios de datas
│   ├── home/              # Seções institucionais e assistente de agendamento (5 etapas)
│   ├── layout/            # Header, Footer e navegação mobile acessível
│   └── shared/            # Componentes partilhados (TreeLogo, botão WhatsApp)
├── lib/
│   ├── auth/              # Verificação server-side de permissões administrativas
│   ├── booking/           # Constantes de horários, validações e fuso horário (Europe/Lisbon)
│   ├── notifications/     # Serviço de e-mails Resend, templates PT-PT e testes unitários
│   ├── security/          # Rate limiting distribuído (HMAC-SHA256 + RPC PostgreSQL) e testes
│   └── supabase/          # Clientes Supabase (browser, server SSR e admin service_role) e tipos
└── supabase/
    └── migrations/        # 8 migrações SQL versionadas (esquema, RLS, privilégios, RGPD e rate limiting)
```

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
  * Modalidades disponíveis: Consulta Presencial (no gabinete em Ovar) e Consulta Online (Videochamada).
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
* **Prevenção de Conflitos:** Validação atómica na base de dados (`idx_unique_active_appointment_slot`) impedindo marcações concorrentes no mesmo dia e horário.
* **Bloqueios e Exceções:** Prioridade de regras de bloqueio diário ou horário configuradas via painel de administração (`availability_schedules`).
* **Validações Server-side:** Sanitização rigorosa de nome, e-mail (RFC 5322), telefone/WhatsApp e limitação de notas opcionais.
* **Rate Limiting Distribuído:** Proteção transacional em PostgreSQL contra submissões abusivas por IP, e-mail e telefone antes de qualquer escrita na tabela de marcações.
* **Consentimento:** O registo da consulta exige obrigatoriamente `consent_given === true`.

---

## Segurança e Rate Limiting Distribuído (Phase 9.7)
Para garantir proteção eficaz em arquiteturas serverless multi-instância (onde limitadores em memória local não partilham estado), o sistema implementa **rate limiting distribuído apoiado em PostgreSQL** (`lib/security/rate-limit.ts` e migração `20261119000000_phase9_7_distributed_rate_limiting.sql`):

* **Estado Partilhado em PostgreSQL:** Tabela dedicada `public.booking_rate_limits` e função transacional `public.check_and_record_booking_rate_limit`.
* **Pseudonimização com HMAC-SHA256 (Minimização de Dados RGPD):** O endereço IP canónico (IPv4/IPv6), o e-mail normalizado e o telefone normalizado **nunca são armazenados em texto limpo** na tabela de rate limit. O servidor calcula digests HMAC-SHA256 com prefixos de separação de domínio (`ip:`, `email:`, `phone:`) usando uma chave de 256 bits derivada do segredo exclusivo de servidor `RATE_LIMIT_SECRET` (com fallback para `SUPABASE_SERVICE_ROLE_KEY`).
* **Limites em Janela Deslizante (15 minutos / 900 segundos):**
  * **Por IP:** máximo de **5 tentativas** a cada 15 minutos.
  * **Por E-mail:** máximo de **3 tentativas** a cada 15 minutos.
  * **Por Telefone:** máximo de **3 tentativas** a cada 15 minutos.
* **Atomicidade e Prevenção de Deadlocks (`pg_advisory_xact_lock`):** A RPC adquire *advisory locks* transacionais de 64 bits (`pg_advisory_xact_lock(hashtextextended(...))`) ordenados lexicograficamente pelas três chaves antes de avaliar os contadores. A decisão é estritamente *all-or-nothing*: se qualquer dimensão exceder o limite, nenhum timestamp novo é gravado nas restantes dimensões.
* **Comportamento Fail-Closed:** Se ocorrer erro de ligação à base de dados, falha da RPC, resposta inválida ou ausência de segredo criptográfico no servidor, a submissão é recusada de forma segura (*fail-closed*), sem expor dados internos nem registar PII em texto limpo nos logs.
* **Hardening de Privilégios e RLS:**
  * A função `public.check_and_record_booking_rate_limit` opera como `SECURITY DEFINER`, com proprietário explícito `postgres` e `SET search_path = pg_catalog, public`.
  * A tabela `public.booking_rate_limits` tem **Row Level Security (RLS)** ativado sem políticas públicas (*default deny*) e tem todos os privilégios diretos revogados para `PUBLIC`, `anon`, `authenticated` e `service_role`.
  * A permissão `EXECUTE` na função RPC é concedida exclusivamente à role `service_role`.

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
*(Consulte `.env.example` para a lista completa de variáveis: Supabase, `RATE_LIMIT_SECRET`, Resend e URL canónica).*

### 3. Migrações da Base de Dados (Supabase)
As migrações SQL encontram-se em `supabase/migrations/` por ordem cronológica (desde o esquema inicial e políticas RLS até ao rate limiting distribuído da Phase 9.7) e podem ser aplicadas num projeto Supabase via Supabase CLI (`supabase db push`) ou SQL Editor.

### 4. Execução em Desenvolvimento
```bash
npm run dev
```
Aceda a `http://localhost:3000`.

### 5. Testes Automatizados, Qualidade de Código e Validação
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
* **Segredos Server-Only:** `SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_SECRET` e `RESEND_API_KEY` são exclusivos do servidor (`import "server-only"`) e nunca devem ser importados em componentes de cliente nem expostos no bundle do browser.
* **Base de Dados:** Proibida a execução de comandos ad-hoc de mutação (`INSERT`, `UPDATE`, `DELETE`) em ambiente de produção sem aprovação.
* **Deploy:** Todos os deploys de produção devem passar pelas fases formais de validação.

---

## Estado do Projeto

* **Fase:** Phase 10 — Em Produção (`https://grcpsi.pt`)
* **Status:** Concluído e em operação

### Subfases da Phase 9 (Production Readiness & Security Hardening):
* [x] **9.1** Auditoria de Production Readiness *(Concluída)*
* [x] **9.2** Segurança & Correções Técnicas *(Concluída)*
* [x] **9.3** SEO & Acessibilidade *(Concluída)*
* [x] **9.4** Documentação & Alinhamento *(Concluída)*
* [x] **9.5** Preparação para Deploy *(Concluída)*
* [x] **9.6** Validação Final Pré-Lançamento *(Concluída)*
* [x] **9.7** Distributed Booking Rate Limiting (PostgreSQL + HMAC-SHA256) *(Concluída)*

---

# Website Psi-Grace (English Version)

## Identification
* **Entity:** Institutional website of Psychologist Grace Azevedo da Graça
* **Activity:** Clinical Psychology
* **OPP Professional License:** 25999 (Ordem dos Psicólogos Portugueses)
* **Certification:** EuroPsy
* **Office Location:** Ovar, Aveiro, Portugal
* **Official Website:** https://grcpsi.pt | https://www.grcpsi.pt

---

## Project Objective
This project provides a professional, welcoming, and secure institutional web platform for the practice of clinical psychologist Grace Azevedo da Graça. Its core objectives are to present her clinical approach, areas of practice, and consultation space, provide direct contact via WhatsApp, and offer a complete online appointment request system with an administrative management dashboard. The platform includes privacy and data protection features designed to support compliance with the General Data Protection Regulation (GDPR / RGPD).

---

## Official Technology Stack
The project stack is strictly composed of:
* **Framework:** Next.js 16.4.6 (App Router, Turbopack, Server Actions)
* **UI Library:** React 19.2.8
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS v4
* **Backend & Database:** Supabase
  * PostgreSQL (with dedicated tables for appointments, availability, administrators, and distributed rate limiting)
  * Supabase Auth (secure authentication for the administrative area)
  * Row Level Security (RLS), `SECURITY DEFINER` functions with strict `search_path`, & Least-Privilege table permission hardening
* **Transactional Email Provider:** Resend (using the official SDK, header-injection protection, HTML escaping, and responsive HTML templates in PT-PT)
* **Package Manager:** npm (with a consistent lockfile `package-lock.json`)

---

## System Architecture
The project follows a modern full-stack **Next.js App Router** architecture with strict client/server boundary enforcement (`import "server-only"`):

```text
├── app/
│   ├── admin/             # Admin dashboard (/admin & /admin/login) protected by Middleware and RLS
│   ├── booking/           # Server Actions for booking validation, distributed rate limiting, and persistence
│   ├── privacidade/       # Institutional Privacy Policy and GDPR compliance page
│   ├── layout.tsx         # Root layout, SEO metadata, Open Graph, and typography
│   ├── page.tsx           # Institutional homepage and integrated booking flow
│   ├── robots.ts          # Crawler rules (explicitly disallowing /admin indexing)
│   └── sitemap.ts         # Dynamic XML sitemap
├── components/
│   ├── admin/             # Appointment management, weekly schedules, and date overrides
│   ├── home/              # Institutional sections and 5-step interactive booking wizard
│   ├── layout/            # Header, Footer, and accessible mobile navigation
│   └── shared/            # Reusable visual components (TreeLogo, floating WhatsApp CTA)
├── lib/
│   ├── auth/              # Server-side administrative authorization helpers
│   ├── booking/           # Time-slot constants, validations, and Europe/Lisbon timezone utilities
│   ├── notifications/     # Resend email service, PT-PT HTML templates, and unit tests
│   ├── security/          # Distributed rate limiting (HMAC-SHA256 + PostgreSQL RPC) and test suite
│   └── supabase/          # Supabase clients (browser, SSR server, and service_role admin) & types
└── supabase/
    └── migrations/        # 8 versioned SQL migrations (schema, RLS, privileges, GDPR, and rate limiting)
```

---

## Implemented Features

* **Institutional Website:**
  * Presentation of the psychologist, academic background, and clinical approach (Systemic and CBT / TCC).
  * Areas of intervention and specialties (adults, couples, families, children, and adolescents).
  * Gallery featuring real photographs of the clinic, consultation room, children's space, and building facade.
  * Location section with the physical address in Ovar and interactive map integration.
  * Interactive Frequently Asked Questions (FAQ) with practical information.
  * Direct contact and floating WhatsApp button.

* **Online Appointment Booking System:**
  * Available modalities: In-Person Consultation (at the office in Ovar) and Online Consultation (Video Call).
  * Standardized consultation slots with a 1-hour duration.
  * Dynamic date selection with a monthly calendar and real-time availability verification.
  * Server-side form validations and strict time-slot conflict prevention.

* **Administrative Dashboard:**
  * Protected routes `/admin` and `/admin/login`.
  * Authentication via Supabase Auth protected by Next.js Middleware and server-side privilege verification.
  * Appointment management (detailed view, confirmation, cancellation, and notes).
  * Availability management and date/time blocking (`date_overrides`).

* **Email Notifications:**
  * Automatic dispatch of transactional emails via Resend upon appointment creation, confirmation, or cancellation.
  * Responsive HTML templates aligned with the clinic's visual identity for both the patient and the psychologist.

* **Privacy and GDPR (RGPD):**
  * Dedicated institutional page `/privacidade` detailing data processing and protection.
  * Mandatory prior consent on the booking form with immutable timestamp and policy version logging.
  * Privacy notice guiding patients not to share sensitive clinical details in the booking request.

* **SEO & Accessibility:**
  * Canonical metadata, dynamic `sitemap.xml`, and `robots.ts` with explicit protection preventing indexing of `/admin` and `/admin/`.
  * Complete semantic association of `htmlFor` and `id` across form fields for assistive navigation.

---

## Scheduling Rules
The scheduling system operates under strict server-validated rules:
* **Duration:** Consultations have a standard duration of 60 minutes (authorized full-hour slots).
* **Timezone:** All operations, past/future checks, and bookings operate in the official `Europe/Lisbon` timezone.
* **Modalities:** Support for in-person and online consultations.
* **Conflict Prevention:** Atomic database validation (`idx_unique_active_appointment_slot`) preventing concurrent bookings on the same date and time slot.
* **Blocks and Exceptions:** Priority enforcement for daily or hourly blocking rules configured via the administration panel (`availability_schedules`).
* **Server-side Validations:** Strict sanitization of name, email (RFC 5322), phone/WhatsApp, and length limits on optional notes.
* **Distributed Rate Limiting:** Transactional PostgreSQL protection against abusive submissions per IP, email, and phone number prior to any appointment insert.
* **Consent:** Recording an appointment strictly requires `consent_given === true`.

---

## Security & Distributed Booking Rate Limiting (Phase 9.7)
To ensure reliable abuse protection across multi-instance serverless deployments (where in-memory rate limiters do not share state), the platform implements **PostgreSQL-backed distributed rate limiting** (`lib/security/rate-limit.ts` and migration `20261119000000_phase9_7_distributed_rate_limiting.sql`):

* **PostgreSQL Shared State:** Dedicated table `public.booking_rate_limits` and transactional RPC `public.check_and_record_booking_rate_limit`.
* **HMAC-SHA256 Pseudonymization (GDPR Data Minimization):** Canonical client IP addresses (IPv4/IPv6), normalized email addresses, and normalized phone numbers are **never stored in plaintext** in the rate-limit table. The server derives domain-separated HMAC-SHA256 digests (`ip:`, `email:`, `phone:`) using a 256-bit key derived from the server-only secret `RATE_LIMIT_SECRET` (falling back to `SUPABASE_SERVICE_ROLE_KEY`).
* **15-Minute (900-Second) Sliding-Window Limits:**
  * **Per IP Address:** maximum of **5 requests** per 15 minutes.
  * **Per Email Address:** maximum of **3 requests** per 15 minutes.
  * **Per Phone Number:** maximum of **3 requests** per 15 minutes.
* **Atomicity & Deadlock-Free 64-Bit Advisory Locks (`pg_advisory_xact_lock`):** The PostgreSQL RPC acquires 64-bit transaction-scoped advisory locks (`pg_advisory_xact_lock(hashtextextended(...))`) sorted lexicographically across all three identifier keys before inspecting active timestamps. Enforcement is strictly *all-or-nothing*: if any dimension is rate-limited, no timestamps are recorded for the remaining dimensions.
* **Fail-Closed Behavior:** If the database connection fails, the RPC errors, returns an unexpected payload, or the server secret is missing, the booking request is rejected safely (*fail-closed*) without exposing internal details or logging plaintext PII.
* **Privilege & RLS Hardening:**
  * `public.check_and_record_booking_rate_limit` runs as `SECURITY DEFINER`, owned by `postgres`, with `SET search_path = pg_catalog, public`.
  * `public.booking_rate_limits` has **Row Level Security (RLS)** enabled with zero public policies (*default deny*), and direct table privileges are revoked from `PUBLIC`, `anon`, `authenticated`, and `service_role`.
  * `EXECUTE` permission on the RPC is granted exclusively to `service_role`.

---

## Administrative Dashboard
Access to appointment management is located at:
* `/admin/login` — Authentication of administrative credentials via Supabase Auth.
* `/admin` — Main control panel.

**Security:**
* Protected by Next.js Middleware (redirecting unauthenticated users).
* Server-side user session verification matched against the `ADMIN_EMAIL` variable.
* Hardened RLS policies in the database (restricted table permissions and server-isolated service role).

---

## Email Notifications (Resend)
* **Integration:** Implemented via the `resend` package in a strictly server-side environment (`lib/notifications/`).
* **Templates:** File `lib/notifications/templates.ts` in European Portuguese (PT-PT) containing booking details, office address or video call instructions, and legal privacy notice.
* **Current Delivery Status:**
  * The system supports both development and production environments through `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
  * In testing/onboarding environments, Resend's default test sender (`onboarding@resend.dev`) can be used for registered account emails.
  * For production, the verified custom domain must be configured in the Resend dashboard (e.g., `notificacoes@grcpsi.pt`).

---

## Privacy and GDPR (RGPD)
In compliance with the General Data Protection Regulation (EU Regulation 2016/679):
* **Policy Page:** Available at `/privacidade`, accessible across the entire website and within the booking form.
* **Consent Logging:** When appointments are created, the following fields are stored in the database:
  * `consent_given`: `true`
  * `consent_timestamp`: ISO UTC timestamp at the moment of submission
  * `consent_version`: Active policy version (e.g., `2026-10-01`)
* **Data Minimization:** Collection is strictly limited to the contact details required to manage the consultation.
* **Clinical Notice:** Visible alert in the form instructing the patient not to enter mental health or diagnostic data in the notes field.

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy the example file and configure the required values in your `.env.local`:
```bash
cp .env.example .env.local
```
*(See `.env.example` for the complete list of variables: Supabase, `RATE_LIMIT_SECRET`, Resend, and canonical URL).*

### 3. Database Migrations (Supabase)
All SQL migrations are located in `supabase/migrations/` in chronological order (from initial schema and RLS hardening through Phase 9.7 distributed rate limiting) and can be applied via the Supabase CLI (`supabase db push`) or the Supabase SQL Editor.

### 4. Run in Development
```bash
npm run dev
```
Open `http://localhost:3000`.

### 5. Automated Testing, Code Quality & Validation
Before submitting changes, run the full validation suite:
```bash
npm run build      # Validates production build and Turbopack
npm run lint       # Runs ESLint linter
npx tsc --noEmit   # Validates strict TypeScript typing
```

---

## Development Workflow
The project follows a strict stage-gated delivery lifecycle:
```text
IMPLEMENT → VALIDATE → REVIEW → APPROVE → COMMIT → NEXT PHASE
```
* Do not create automatic commits without diff approval.
* Do not push or deploy without explicit authorization.
* Never modify or commit `.env.local` files or active credentials.

---

## Security Best Practices
* **Environment Files:** `.env.local` is listed in `.gitignore` and must never be committed to the repository.
* **Server-Only Secrets:** `SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_SECRET`, and `RESEND_API_KEY` are strictly server-only (`import "server-only"`) and must never be imported into client components or exposed in the browser bundle.
* **Database:** Ad-hoc mutation commands (`INSERT`, `UPDATE`, `DELETE`) in the production environment are prohibited without approval.
* **Deployment:** All production deployments must pass the formal validation stages.

---

## Project Status

* **Phase:** Phase 10 — Live in Production (`https://grcpsi.pt`)
* **Status:** Completed and operational

### Phase 9 Subphases (Production Readiness & Security Hardening):
* [x] **9.1** Production Readiness Audit *(Completed)*
* [x] **9.2** Security & Technical Fixes *(Completed)*
* [x] **9.3** SEO & Accessibility *(Completed)*
* [x] **9.4** Documentation & Alignment *(Completed)*
* [x] **9.5** Deployment Preparation *(Completed)*
* [x] **9.6** Final Pre-Launch Validation *(Completed)*
* [x] **9.7** Distributed Booking Rate Limiting (PostgreSQL + HMAC-SHA256) *(Completed)*
