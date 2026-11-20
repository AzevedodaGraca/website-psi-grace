<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Instructions — Psicóloga Grace Azevedo da Graça

## 1. Project Overview

This project is the official professional website for psychologist Grace Azevedo da Graça, whose clinic is located in Ovar, Aveiro, Portugal.

The project will eventually include:
- Professional institutional website
- Appointment scheduling
- Online consultation information
- WhatsApp contact and communication
- AI chatbot
- Future mobile application built with Dart/Flutter

The mobile application is a later project phase and must not be implemented unless explicitly requested.

---

## 2. Source of Truth

`PROJECT_BRIEF.md` is the primary source of truth for the project's requirements, content, business information, services, contact information, design direction, and functional requirements.

Before implementing a feature or making architectural decisions:
1. Read and follow `PROJECT_BRIEF.md`.
2. Do not invent information that is not present in the project requirements.
3. Do not modify factual information about the psychologist, clinic, services, contact details, or professional credentials without explicit authorization.
4. If required information is missing, ask for clarification instead of inventing it.

---

## 3. Visual Identity

The website must follow the visual identity established for the clinic.

Primary visual characteristics:
- White as the main background color.
- Green as the primary accent color.
- Natural, welcoming, calm and professional aesthetic.
- The tree graphic is an important part of the clinic's visual identity.
- The design should communicate trust, warmth, professionalism and psychological care.
- Avoid excessive visual effects, excessive animations, or visually aggressive design.

Do not introduce a new color palette without explicit approval.

Use the real clinic assets whenever appropriate instead of replacing them with generated placeholders.

---

## 4. Assets

Project assets are stored under:

`/assets`

with the following organization:

- `assets/clinic/` — photographs of the clinic and its spaces.
- `assets/grace/` — photographs of Grace.
- `assets/branding/` — tree/logo and other branding elements.

Respect the existing assets and their intended use.

Do not replace real photographs with AI-generated images or stock images unless explicitly requested.

Do not alter, retouch, or distort Grace's photographs without explicit approval.

Use descriptive filenames and maintain the existing asset organization.

---

## 5. Website Content

The website must represent the psychologist and her clinic accurately and professionally.

Do not:
- Invent qualifications.
- Invent treatments or services.
- Invent prices.
- Invent opening hours.
- Invent appointment availability.
- Invent patient testimonials.
- Invent medical or psychological claims.
- Invent contact information.

Use only information provided in `PROJECT_BRIEF.md` or explicitly provided by the project owner.

---

## 6. Responsive Design

The website must be fully responsive.

Design and test for:
- Desktop
- Laptop
- Tablet
- Mobile phone

Mobile usability is a priority.

Layouts, typography, images, navigation, forms and interactive elements must adapt appropriately to different screen sizes.

---

## 7. Architecture and Code Quality

Use the existing Next.js architecture and conventions.

Prefer:
- Reusable React components
- Clear component boundaries
- Semantic HTML
- Accessible UI
- Strong TypeScript typing
- Maintainable CSS/Tailwind classes
- Clear naming conventions
- Minimal duplication
- Clean and understandable code

Do not introduce unnecessary libraries or dependencies.

Before adding a dependency, determine whether the existing stack can solve the problem without it.

---

## 8. Accessibility

Accessibility must be considered from the beginning.

Use:
- Semantic HTML
- Accessible buttons and links
- Proper labels for form fields
- Meaningful alt text for images
- Keyboard-accessible interactions
- Sufficient color contrast
- Clear focus states

Do not use images as the only way to communicate important information.

---

## 9. SEO and Professional Website Standards

The website should be built with professional SEO foundations.

Consider:
- Appropriate page titles
- Metadata
- Semantic headings
- Descriptive image alt text
- Open Graph metadata where appropriate
- Clean URLs
- Good performance
- Mobile-first considerations

Do not use misleading SEO content or keyword stuffing.

---

## 10. Appointment Scheduling (Implemented)

The online appointment scheduling system is implemented and functional.

Key architectural rules:
- Consultations operate in standard 1-hour slots (`FULL_HOUR_SLOTS`).
- Supported modalities: Presencial (Gabinete em Ovar) and Online (Videochamada).
- Timezone: `Europe/Lisbon`.
- Business logic resides server-side in `app/booking/actions.ts`.
- Persistence and conflict prevention are handled in Supabase (`appointments` and `availability_schedules`).
- RGPD consent is strictly required on every submission (`consent_given`, `consent_timestamp`, `consent_version`).
- Future modifications must respect the existing data model, schemas, and RLS policies.
- Do not alter booking rules, slots, or validation constraints without explicit authorization.

---

## 11. Online Consultations

Online consultations are offered by the psychologist.

Video consultations will NOT be implemented as a custom video-call system inside the website or application.

The intended communication method for video consultations is video call (Videochamada), without specifying a mandatory platform.

Do not implement WebRTC, custom video rooms, Zoom-like functionality, or another video platform unless explicitly requested.

---

## 12. Chatbot

> **CHATBOT STATUS:** **ADIADO / FORA DO ESCOPO DO LANÇAMENTO INICIAL.**
>
> The AI chatbot will **NOT** be implemented in the initial website launch.
> Do not implement the chatbot automatically.
> Initial patient triage and contact remain centered on the clinic's official WhatsApp (+351 926 362 033) and the online booking form.
> This feature may be reconsidered in a future phase after public launch.

### Mandatory Ethical and Clinical Guidelines (For Future Reference)
When considered in the future, the chatbot must be strictly designed as an informative assistant and must never:
- Diagnose patients.
- Provide psychological or psychiatric diagnoses.
- Replace professional psychological care or clinical evaluation.
- Simulate a psychotherapy session or give clinical advice.
- Provide emergency medical advice.
- Make clinical decisions.

In any scenario suggesting acute emotional crisis or emergencies, the assistant must direct the user to official health hotlines (e.g., SNS 24 — 808 24 24 24) or direct contact with the psychologist via WhatsApp.

---

## 13. Privacy and Sensitive Information (GDPR / RGPD)

This is a psychology/healthcare-related website.

Treat user-provided information and appointment data as sensitive:
- Maintain full GDPR compliance (`/privacidade` page and immutable consent logs).
- Do not expose personal or appointment data publicly.
- Do not log sensitive user information to client consoles or server logs.
- Never store patient information in insecure client-side storage.
- Respect database RLS policies and server-only service role execution.

---

## 14. Development Process & Workflow

The project follows a strict phased governance lifecycle:

```text
IMPLEMENTAR
→ VALIDAR
→ REVISAR
→ APROVAR
→ COMMIT
→ PRÓXIMA FASE
```

Mandatory execution rules:
1. **No Unapproved Commits:** Never create a Git commit before presenting the exact diff and receiving explicit user approval.
2. **No Automatic Pushes or Deploys:** Never push to remote or trigger production deployments without authorization.
3. **No Unsafe Environment Changes:** Never commit, display, print, or modify `.env.local` or production API keys.
4. **No Ad-Hoc Database Mutations:** Never execute arbitrary `INSERT`, `UPDATE`, or `DELETE` queries against production tables during testing unless explicitly instructed.
5. **Smallest Coherent Change:** Work incrementally; do not modify unrelated files.

---

## 15. AI Agent Rules

The AI agent must act as a software engineering assistant, not as the sole decision maker.

When requirements are ambiguous:
- Ask for clarification.
- Do not guess important business rules.
- Do not invent content.

When implementing UI:
- Follow the established visual identity (white, clinic green, natural tones, official tree logo).
- Reuse existing clinic photographs; do not use AI-generated images or stock photos for the clinic.

When implementing functionality:
- Follow the approved roadmap.
- Do not implement future phases prematurely.

Always prioritize correctness, maintainability, accessibility, security and user experience.

---

## 16. Project Roadmap

The project is developed incrementally.

Status by Phase:

1. **Phase 1 — Project Setup & Architecture:** CONCLUÍDA
2. **Phase 2 — Visual Identity & Base Components:** CONCLUÍDA
3. **Phase 3 & 4 — Professional Website Pages & Content:** CONCLUÍDA
4. **Phase 5 — Online Appointment Scheduling System:** CONCLUÍDA
5. **Phase 6 — WhatsApp Flow & Clinic Content Alignment:** CONCLUÍDA
6. **Phase 7 — Supabase Backend & Admin Management Area (`/admin`):** CONCLUÍDA
7. **Phase 8 — Transactional Email Notifications (Resend):** CONCLUÍDA
8. **Phase 9 — Production Readiness:** CONCLUÍDA
   - **9.1** Auditoria de Production Readiness — CONCLUÍDA
   - **9.2** Segurança & Correções Técnicas (Next.js 16.4.6 patch) — CONCLUÍDA
   - **9.3** SEO & Acessibilidade — CONCLUÍDA
   - **9.4** Documentação & Alinhamento — CONCLUÍDA
   - **9.5** Preparação para Deploy — CONCLUÍDA
   - **9.6** Validação Final Pré-Lançamento — CONCLUÍDA
9. **Chatbot de IA:** ADIADO / PÓS-LANÇAMENTO
10. **Phase 10 — Lançamento Oficial em Produção (Vercel & Domínio `grcpsi.pt`):** CONCLUÍDA
11. **Mobile Application (Dart/Flutter):** FASE POSTERIOR PÓS-LANÇAMENTO

---

## 17. Important Rule

When in doubt, stop and ask for clarification rather than making assumptions about the psychologist, clinic, patients, appointments, services, prices, availability, or medical/psychological information.