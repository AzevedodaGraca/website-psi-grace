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
* **Framework:** Next.js 16.3.8 (App Router, Turbopack, Server Actions)
* **UI Library:** React 19.2.8
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS v4
* **Backend & Database:** Supabase
  * PostgreSQL (with dedicated tables for appointments and availability)
  * Supabase Auth (secure authentication for the administrative area)
  * Row Level Security (RLS) & Table privilege hardening
* **Transactional Email Provider:** Resend (using the official SDK and HTML templates in PT-PT)
* **Package Manager:** npm (with a consistent lockfile `package-lock.json`)

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
* **Conflict Prevention:** Atomic database validation preventing concurrent bookings on the same date and time slot.
* **Blocks and Exceptions:** Priority enforcement for daily or hourly blocking rules configured via the administration panel (`availability_schedules`).
* **Server-side Validations:** Strict sanitization of name, email (RFC 5322), phone/WhatsApp, and length limits on optional notes.
* **Consent:** Recording an appointment strictly requires `consent_given === true`.

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
*(See `.env.example` for the complete list of variables: Supabase, Resend, and canonical URL).*

### 3. Run in Development
```bash
npm run dev
```
Open `http://localhost:3000`.

### 4. Code Quality and Validation
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
* **Service Keys:** `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-only and must never be imported into client components or exposed in the browser bundle.
* **Database:** Ad-hoc mutation commands (`INSERT`, `UPDATE`, `DELETE`) in the production environment are prohibited without approval.
* **Deployment:** All production deployments must pass the formal validation stages.

---

## Project Status

* **Phase:** Phase 9 — Production Readiness
* **Status:** In progress

### Phase 9 Subphases:
* [x] **9.1** Production Readiness Audit *(Completed)*
* [x] **9.2** Security & Technical Fixes *(Completed)*
* [x] **9.3** SEO & Accessibility *(Completed)*
* [x] **9.4** Documentation & Alignment *(In progress)*
* [ ] **9.5** Deployment Preparation *(Pending)*
* [ ] **9.6** Final Pre-Launch Validation *(Pending)*
