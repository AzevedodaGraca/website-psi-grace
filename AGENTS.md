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

## 10. Appointment Scheduling

Appointment scheduling is part of the planned website functionality.

The scheduling system must eventually allow users to:
- View available dates
- View available times
- Select an appointment
- Provide the required information
- Receive appropriate confirmation

Do not implement the final booking logic until the required business rules and data model have been explicitly defined.

Never invent availability.

---

## 11. Online Consultations

Online consultations will be offered by the psychologist.

Video consultations will NOT be implemented as a custom video-call system inside the website or application.

The intended communication method for video consultations is normal WhatsApp.

Do not implement WebRTC, custom video rooms, Zoom-like functionality, or another video platform unless explicitly requested.

---

## 12. Chatbot

An AI chatbot is planned for the website.

The chatbot must be designed carefully and must not:
- Diagnose patients.
- Provide psychological diagnoses.
- Replace professional psychological care.
- Provide emergency medical advice.
- Make clinical decisions.

The chatbot should primarily assist with general information, navigation, frequently asked questions, services and appointment-related information, according to the requirements defined for the project.

Do not implement the chatbot until its scope and technical architecture are explicitly defined.

---

## 13. Privacy and Sensitive Information

This is a psychology/healthcare-related website.

Treat user-provided information and appointment data as potentially sensitive.

Do not expose personal information unnecessarily.

Do not log sensitive user information to the browser console or server logs.

Do not store patient information in client-side storage unless explicitly required and properly designed.

Privacy, security and applicable data-protection requirements must be considered before implementing appointment storage or patient-related functionality.

---

## 14. Development Process

Work incrementally.

Do not implement the entire project in one step.

Before making significant changes:
1. Understand the existing architecture.
2. Read the relevant project documentation.
3. Identify the affected files.
4. Explain the proposed approach when appropriate.
5. Implement the smallest coherent change.
6. Verify the result.
7. Fix errors before continuing.

Do not modify unrelated files.

Do not remove existing functionality unless explicitly requested.

---

## 15. AI Agent Rules

The AI agent must act as a software engineering assistant, not as the sole decision maker.

When requirements are ambiguous:
- Ask for clarification.
- Do not guess important business rules.
- Do not invent content.

When implementing UI:
- Follow the established visual identity.
- Reuse existing assets.
- Prefer real project content over placeholders.

When implementing functionality:
- Follow the project roadmap.
- Do not implement future phases prematurely.

Always prioritize correctness, maintainability, accessibility, security and user experience.

---

## 16. Project Roadmap

The project will be developed incrementally.

High-level order:

1. Project setup and architecture
2. Visual identity and website foundation
3. Professional website pages and sections
4. Responsive design and accessibility
5. Appointment scheduling
6. WhatsApp integration/contact flows
7. AI chatbot
8. Testing and refinement
9. Production deployment
10. Mobile application with Dart/Flutter

The Flutter application is a separate later phase and must not influence the current implementation unnecessarily.

---

## 17. Important Rule

When in doubt, stop and ask for clarification rather than making assumptions about the psychologist, clinic, patients, appointments, services, prices, availability, or medical/psychological information.