# PROJECT BRIEF — Website Psicóloga Grace Azevedo da Graça

**Versão:** 1.2
**Status:** Em Produção (`https://grcpsi.pt`)
**Fase atual:** Phase 10 — Concluída
**Subfase:** Em operação
**Projeto:** Website profissional da Psicóloga Grace Azevedo da Graça
**Localização:** Ovar, Aveiro, Portugal

---

# 1. Visão do Projeto

Este projeto consiste no desenvolvimento de um website profissional para a psicóloga clínica **Grace Azevedo da Graça**, com consultório localizado em Ovar, Aveiro, Portugal.

O website deverá transmitir uma imagem profissional, acolhedora, humana, elegante e confiável, utilizando como principal identidade visual a combinação de **branco, verde e elementos naturais inspirados na árvore utilizada na identidade da clínica**.

O website terá como objetivos principais:

* Apresentar a psicóloga e sua formação profissional.
* Apresentar a abordagem terapêutica utilizada.
* Apresentar os tipos de atendimento.
* Apresentar as áreas de atuação.
* Apresentar o consultório físico.
* Informar sobre atendimento presencial e online.
* Facilitar o contato através do WhatsApp.
* Disponibilizar o agendamento online de consultas (implementado).
* Apresentar a localização do consultório.
* Integrar Google Maps.
* Apresentar perguntas frequentes.
* Integrar o Instagram profissional.
* Disponibilizar uma área administrativa de gestão (implementada).
* Chatbot assistente (STATUS ATUAL: ADIADO / FORA DO ESCOPO DO LANÇAMENTO INICIAL; ver Secção 23).
* Servir como base para um futuro aplicativo mobile desenvolvido em Dart/Flutter.

O website deverá ser responsivo e funcionar corretamente em:

* Computadores.
* Tablets.
* Smartphones.

---

# 2. Informações da Psicóloga

## Dados profissionais

**Nome completo:**
Grace Azevedo da Graça

**Nome profissional:**
Grace Azevedo da Graça

**Profissão:**
Psicóloga Clínica

**OPP:**
25999

**Localização profissional:**
Ovar / Aveiro, Portugal

**Endereço do consultório:**
Rua de Timor, 67 – 1º H
3880-180
Ovar, Aveiro, Portugal

**Telefone / WhatsApp:**
+351 926 362 033

**E-mail profissional:**
[gracepsi@hotmail.com](mailto:gracepsi@hotmail.com)

**Instagram profissional:**
@grcpsi

---

# 3. Biografia Profissional

Texto fornecido pela profissional:

"Graduada em psicologia pela Universidade Estácio de Sá em 2015, com especialização em Terapia Familiar e de Casal, abordagem Sistêmica no curso Grão em 2016. Registada na Ordem dos Psicólogos Portugueses e com certificação Europsy. Desde graduada atua em consultório particular, primeiro no Brasil e atualmente em Portugal, fazendo acompanhamento psicológico dos utentes, promovendo a saúde psíquica e comportamental do indivíduo."

---

# 4. Formação e Especializações

## Formação acadêmica

* Graduação em Psicologia — Universidade Estácio de Sá — 2015.

## Especialização

* Terapia Familiar e de Casal, abordagem Sistêmica.
* Grão - Cursos e Serviços em Psicologia — 2016.
* Introdução a Caixa de Areia — Grão - Cursos e Serviços em Psicologia.

## Certificação

* Registo na Ordem dos Psicólogos Portugueses.
* Certificação EuroPsy.

## Experiência

* Mais de 10 anos de experiência profissional.

---

# 5. Abordagem Terapêutica

As abordagens informadas pela profissional são:

* Sistêmica.
* Terapia Cognitivo-Comportamental (TCC).
* Entre outras abordagens.

O website não deverá inventar ou atribuir outras abordagens à profissional que não tenham sido fornecidas.

---

# 6. Tipos de Atendimento

A clínica oferece:

* Atendimento presencial.
* Atendimento online.
* Atendimento infantil.
* Atendimento para adolescentes.
* Atendimento para adultos.
* Atendimento para casais.
* Atendimento para famílias.

---

# 7. Áreas de Atuação

As áreas informadas pela profissional são:

* Ansiedade.
* Depressão.
* Relacionamentos.
* Burnout.
* Autoestima.
* PHDA.
* Autoconhecimento.
* Traumas.
* Terapia de Casal e Família.

O website deverá apresentar essas áreas de forma clara e acolhedora, sem transformar o conteúdo institucional em diagnóstico ou aconselhamento clínico automatizado.

---

# 8. Horários e Disponibilidade

## Dias de atendimento

* Segunda-feira a Sexta-feira (dias úteis).
* Atendimento **por marcação prévia**.

## Horário e Slots Implementados

O sistema opera com consultas em **slots padronizados de 1 hora** (60 minutos):
* Horários autorizados: `09:00`, `10:00`, `11:00`, `12:00`, `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`, `20:00`.
* Fuso Horário Oficial: `Europe/Lisbon`.

## Gestão de Disponibilidade (Implementada)

A disponibilidade real é controlada dinamicamente através do backend e do painel administrativo:
* Regras semanais baseadas em `availability_schedules`.
* Capacidade de bloqueio de dias inteiros ou horários específicos pela profissional através da gestão de exceções (`date_overrides`).
* Validação atómica server-side impedindo marcações em slots já ocupados ou datas passadas.

---

# 9. Valores e Pagamento

## Primeira consulta

* Primeira entrevista gratuita.

## Formas de pagamento

* MB Way.
* Transferência bancária.

Não inventar outros valores, preços ou métodos de pagamento.

Caso sejam adicionados preços posteriormente, eles deverão ser tratados como dados configuráveis.

---

# 10. Identidade Visual

## Direção visual

O website deverá utilizar uma estética:

* Clean.
* Acolhedora.
* Profissional.
* Elegante.
* Natural.
* Humana.
* Minimalista.

A identidade visual deverá transmitir confiança e tranquilidade.

## Cores principais

A identidade visual será baseada principalmente em:

* Branco.
* Verde inspirado na árvore da identidade visual.
* Marrom presente no tronco da árvore.
* Tons muito suaves e neutros como apoio.

O branco deverá ser a cor predominante da interface.

O verde deverá ser utilizado principalmente em:

* Botões.
* Links.
* Elementos de destaque.
* Ícones.
* Pequenos detalhes visuais.
* Estados ativos.
* Elementos relacionados à identidade da clínica.

O marrom deverá ser utilizado de forma complementar, especialmente em elementos relacionados à árvore e em detalhes visuais.

### IMPORTANTE

Não utilizar uma paleta verde genérica escolhida aleatoriamente.

A paleta deverá ser visualmente inspirada nos materiais reais fornecidos pela clínica, especialmente na árvore e na placa da fachada.

Os valores exatos de cores poderão ser definidos tecnicamente durante a implementação através dos assets oficiais.

---

# 11. Árvore da Identidade Visual

A árvore fornecida pela clínica é um elemento oficial da identidade visual.

Ela deverá ser utilizada como asset original.

IMPORTANTE:

* Não recriar a árvore com IA.
* Não substituir a árvore por outra ilustração.
* Não modificar sua aparência sem autorização.
* Preservar suas proporções.
* Utilizar a versão adequada conforme o contexto.
* Utilizar fundo transparente quando disponível.
* Utilizar a composição horizontal fornecida quando apropriado.

A árvore poderá aparecer em:

* Header.
* Hero.
* Footer.
* Seções institucionais.
* Elementos decorativos.
* Futuramente no aplicativo Flutter.

---

# 12. Fotografias e Assets

Foram fornecidas fotografias reais da clínica e da profissional.

Os assets incluem:

* Foto profissional da Grace.
* Foto da fachada do consultório.
* Foto da placa externa da clínica.
* Foto da recepção.
* Fotos da sala de atendimento.
* Fotos do espaço infantil.
* Fotos dos brinquedos e materiais infantis.
* Fotografias da decoração do consultório.
* Imagem oficial da árvore.
* Composição gráfica da árvore com base verde.

As fotografias reais deverão ser priorizadas em relação a imagens genéricas de bancos de imagens.

## Foto da fachada

A fotografia da fachada contendo a placa:

"Grace Azevedo da Graça
Psicóloga Clínica - OPP: 25999"

deverá ser utilizada na seção de localização / "Onde estamos".

Essa seção deverá combinar:

* Foto real da fachada.
* Endereço.
* Localização em Ovar.
* Google Maps.
* Telefone.
* WhatsApp.
* E-mail.
* Instagram.

---

# 13. Estrutura do Website

A estrutura inicial deverá contemplar:

1. Home.
2. Sobre a Grace.
3. Abordagem terapêutica.
4. Áreas de atuação.
5. Tipos de atendimento.
6. Consultório.
7. Atendimento presencial e online.
8. Agendamento.
9. FAQ.
10. Contato.
11. Localização.
12. Footer.

Algumas dessas áreas poderão ser seções da página inicial em vez de páginas independentes.

A arquitetura final de páginas deverá priorizar uma experiência simples e intuitiva.

---

# 14. Homepage

A homepage deverá apresentar uma experiência visual limpa e acolhedora.

Estrutura inicial sugerida:

1. Header / navegação.
2. Hero principal.
3. Frase principal.
4. Apresentação da Grace.
5. Abordagem terapêutica.
6. Áreas de atuação.
7. Tipos de atendimento.
8. Consultório.
9. Atendimento presencial e online.
10. Agendamento.
11. FAQ.
12. Localização.
13. Contato.
14. Footer.

O botão **"Agendar Consulta"** deverá ser um dos principais elementos de ação do website.

O botão de WhatsApp deverá permanecer facilmente acessível.

---

# 15. Frase Principal

Frase fornecida pela profissional:

"O importante não é o que fizeram de nós, mas o que fazemos daquilo que fizeram de nós."

— Jean-Paul Sartre

A frase deverá ser apresentada de forma elegante e visualmente integrada à identidade da clínica.

---

# 16. Mensagem de Acolhimento

Texto fornecido pela profissional:

"Não escolhemos as circunstâncias em que nascemos nem tudo o que nos acontece.

Somos influenciados pela família, pela sociedade, pelos traumas e pelas oportunidades.

Mas continuamos responsáveis pelas escolhas que fazemos a partir dessas circunstâncias."

Esse conteúdo poderá ser utilizado na homepage ou em uma seção institucional.

---

# 17. Missão da Clínica

Missão fornecida pela profissional:

"Promover a saúde psíquica e comportamental do indivíduo."

---

# 18. Valores Profissionais

Texto fornecido pela profissional:

"Cumprir os princípios de conduta profissional estabelecidos na meta-ética, utilizando o conhecimento científico necessário e as competências profissionais."

---

# 19. Localização

O website deverá possuir uma seção dedicada à localização do consultório.

## Endereço

Rua de Timor, 67 – 1º H
3880-180
Ovar / Aveiro, Portugal

## Elementos visuais

A seção deverá apresentar:

* Foto real da fachada/placa.
* Mapa.
* Endereço.
* Botão para obter direções.
* Telefone.
* WhatsApp.
* E-mail.
* Instagram.

A foto da fachada deverá ser utilizada como elemento visual principal da seção "Onde estamos".

---

# 20. WhatsApp

O WhatsApp será o principal canal direto de comunicação.

Telefone:

+351 926 362 033

O website deverá possuir:

* Botão de WhatsApp no header ou área de contato.
* Botão de WhatsApp na seção de contato.
* Possibilidade de botão flutuante.
* Links apropriados para iniciar uma conversa no WhatsApp.

## Atendimento online

As consultas online serão realizadas através de videochamada.

IMPORTANTE:

Não desenvolver sistema próprio de videochamada.

Não implementar:

* WebRTC.
* Videochamada própria.
* Servidor de vídeo.
* Sistema de conferência.

O website/app deverá apenas facilitar o contato e o agendamento.

---

# 21. Agendamento Online (Implementado)

O sistema de agendamento online encontra-se integralmente implementado e funcional:

Fluxo implementado (5 etapas):

1. **Modalidade:** Utente escolhe entre Consulta Presencial (Gabinete em Ovar) ou Consulta Online (Videochamada).
2. **Data & Horário:** Seleção em calendário mensal com carregamento dinâmico dos horários disponíveis em horas certas (slots de 1 hora, fuso `Europe/Lisbon`).
3. **Dados do Utente:** Preenchimento de Nome Completo, E-mail, Telefone/WhatsApp, Observação opcional (com aviso de privacidade) e aceitação obrigatória da Política de Privacidade (RGPD).
4. **Resumo:** Conferência de todos os dados antes da submissão.
5. **Confirmação:** Gravação atómica no Supabase com status `pending`, prevenção rigorosa de conflitos e disparo imediato de e-mails transacionais (via Resend) para o utente e para a psicóloga.

---

# 22. Área Administrativa (Implementada)

A área administrativa encontra-se implementada e em operação:

* **Acesso:** Rotas `/admin` e `/admin/login`.
* **Segurança & Autenticação:**
  * Autenticação via Supabase Auth.
  * Proteção de rotas através de Next.js Middleware e validação server-side com restrição de acesso ao e-mail administrativo autorizado (`ADMIN_EMAIL`).
  * Políticas de Row Level Security (RLS) e isolamento da chave `SUPABASE_SERVICE_ROLE_KEY` no servidor.
* **Funcionalidades do Painel:**
  * **Gestão de Marcações (`AppointmentsManager`):** Visualização de pedidos com filtros de status (`pending`, `confirmed`, `cancelled`), confirmação, cancelamento e registo de observações.
  * **Gestão de Disponibilidade (`DateOverridesManager`):** Bloqueio de datas inteiras (férias/feriados) ou configuração de exceções para horários específicos na tabela `availability_schedules`.

---

# 23. Chatbot

> **STATUS ATUAL:** **ADIADO / FORA DO ESCOPO DO LANÇAMENTO INICIAL.**
>
> O chatbot de IA **não será implementado** na versão de lançamento atual do website.
> O atendimento e a comunicação inicial permanecem centralizados no WhatsApp oficial da clínica (+351 926 362 033) e no formulário de marcação online.
> A funcionalidade de assistente virtual poderá ser reconsiderada numa fase futura após o lançamento.

### Especificação Conceitual e Limitações Éticas (Para Referência Futura)

Caso venha a ser implementado futuramente, o chatbot atuará estritamente como **assistente virtual informativo da clínica**, e não como substituto da psicóloga.

O chatbot poderá responder a dúvidas práticas sobre:

* Serviços e tipos de atendimento.
* Atendimento presencial e online.
* Localização do consultório em Ovar.
* Horários gerais e funcionamento do agendamento.
* Formas de pagamento e primeira entrevista gratuita.
* FAQ e direcionamento para o WhatsApp oficial.

## Limitações Mandatórias do Chatbot

O chatbot **NUNCA** deverá:

* Fazer diagnóstico psicológico ou psiquiátrico.
* Afirmar que uma pessoa possui determinada patologia.
* Substituir a avaliação clínica profissional.
* Simular uma sessão de psicoterapia ou aconselhamento terapêutico.
* Fornecer aconselhamento clínico em situações de crise ou urgência.
* Inventar informações sobre a profissional ou a clínica.

Em qualquer situação que sugira sofrimento agudo ou necessidade de acompanhamento, o chatbot deverá orientar imediatamente o utilizador a contactar a psicóloga via WhatsApp ou recorrer às linhas nacionais de emergência/saúde mental (ex.: Linha SNS 24 - 808 24 24 24).

---

# 24. FAQ

O website deverá possuir uma seção de perguntas frequentes.

As perguntas deverão ser construídas com base nas informações reais fornecidas pela clínica.

Exemplos de temas:

* Como funciona a primeira entrevista?
* Existe atendimento online?
* Onde fica o consultório?
* Quais públicos são atendidos?
* Quais são as áreas de atuação?
* Como funciona o agendamento?
* Quais formas de pagamento estão disponíveis?

Não inventar respostas para informações que não foram definidas.

---

# 25. Instagram

Instagram profissional:

@grcpsi

O website deverá possuir integração visual/link para o Instagram.

A integração deverá ser simples e não deverá prejudicar o desempenho do website.

---

# 26. Formulário de Contato

O website deverá possuir futuramente um formulário de contato.

O formulário deverá coletar somente as informações necessárias.

Não solicitar informações clínicas ou dados sensíveis desnecessários através do formulário público.

O formulário deverá possuir:

* Nome.
* E-mail.
* Telefone, se necessário.
* Mensagem.

Os campos poderão ser revisados durante a implementação para minimizar coleta de dados.

---

# 27. Privacidade e Segurança (RGPD Implementado)

Este projeto opera sob as diretrizes do **Regulamento Geral sobre a Proteção de Dados (RGPD - Regulamento UE 2016/679)** e da legislação portuguesa aplicável:

### Implementação de Conformidade Realizada:
* **Página de Política de Privacidade:** Criada em `/privacidade`, detalhando os direitos dos titulares, finalidades de tratamento, prazos de conservação e canais de contacto.
* **Consentimento Prévio Obrigatório:** O formulário de marcação exige aceitação expressa dos termos antes do envio.
* **Registo de Consentimento na Base de Dados:** São guardados de forma verificável:
  * `consent_given` (booleano `true`);
  * `consent_timestamp` (carimbo temporal em formato ISO UTC);
  * `consent_version` (versão da política aceite, ex.: `2026-10-01`).
* **Proteção de Dados Clínicos:** Alerta proeminente no formulário informando o utente para não descrever dados clínicos ou diagnósticos no campo de observações.
* **Minimização de Dados:** Apenas os dados de contacto indispensáveis para o agendamento são recolhidos.
* **Isolamento de Credenciais:** Nenhuma chave secreta (`SUPABASE_SERVICE_ROLE_KEY` ou `RESEND_API_KEY`) é exposta ao cliente. `.env.local` é estritamente ignorado pelo Git.

---

# 28. Arquitetura Tecnológica Atual

## Frontend
* **Framework:** Next.js 16.4.6 (App Router, Turbopack, Server Actions)
* **Biblioteca UI:** React 19.2.8
* **Linguagem:** TypeScript 5
* **Estilização:** Tailwind CSS v4

## Backend / Base de Dados
* **Plataforma:** Supabase (BaaS)
* **Base de Dados:** PostgreSQL com schemas e migrations versionadas
* **Políticas:** Row Level Security (RLS) e hardening de privilégios de tabelas

## Autenticação
* **Sistema:** Supabase Auth (utilizado para acesso administrativo à área `/admin`)
* **Proteção:** Next.js Middleware e validação de sessão server-side vinculada ao `ADMIN_EMAIL`

## E-mails Transacionais / Notificações
* **Provedor:** Resend (`resend` SDK)
* **Implementação:** Server-only (`lib/notifications/`) com templates HTML em Português de Portugal para confirmações de consultas e avisos à administração
* **Ambiente:** Suporte a e-mails de teste e transição para domínio verificado em produção

## Inteligência Artificial (Chatbot)
* **STATUS:** **ADIADO / FORA DO ESCOPO DO LANÇAMENTO ATUAL**
* Não há integrações de IA ou chamadas a modelos LLM no lançamento inicial do website.

## Hospedagem
* **Plataforma Prevista:** Vercel

## Futuro Aplicativo Mobile
* **Tecnologia:** Dart / Flutter (etapa posterior ao lançamento do website)

---

# 29. Futuro Aplicativo Flutter

O aplicativo mobile será uma etapa posterior do projeto.

O app deverá ser desenvolvido utilizando:

* Dart.
* Flutter.

O aplicativo poderá futuramente oferecer:

* Informações da clínica.
* Perfil da psicóloga.
* Agendamento.
* Próximas consultas.
* Informações de atendimento.
* Contato via WhatsApp.
* Notificações.
* FAQ.
* Chatbot.
* Outras funcionalidades que sejam definidas posteriormente.

O aplicativo NÃO deverá possuir sistema próprio de videochamada.

As consultas online continuarão a ser realizadas através de videochamada.

---

# 30. Responsividade

O website deverá ser desenvolvido com abordagem mobile-first.

Deverá funcionar corretamente em:

* iPhone.
* Android.
* Tablets.
* Mac.
* Windows.
* Diferentes tamanhos de tela.

Todos os componentes deverão ser responsivos.

A experiência mobile deverá ser tratada como prioridade, principalmente para:

* Agendamento.
* WhatsApp.
* Contato.
* Navegação.
* Localização.

---

# 31. Acessibilidade

O website deverá seguir boas práticas de acessibilidade.

Priorizar:

* Contraste adequado.
* Textos legíveis.
* Navegação por teclado.
* Labels em formulários.
* Texto alternativo para imagens relevantes.
* Estrutura semântica HTML.
* Botões claramente identificáveis.
* Tamanhos adequados para elementos interativos.

---

# 32. SEO

O website deverá ser preparado para mecanismos de busca.

Informações importantes:

* Psicóloga Clínica.
* Grace Azevedo da Graça.
* Ovar.
* Aveiro.
* Psicologia.
* Atendimento psicológico.
* Psicóloga em Ovar.
* Atendimento presencial.
* Atendimento online.

A implementação de SEO deverá incluir:

* Metadata.
* Title.
* Description.
* Open Graph.
* Estrutura semântica.
* URLs amigáveis.
* Sitemap.
* robots.txt.
* Performance adequada.

Não utilizar técnicas de SEO enganosas.

---

# 33. Performance

O website deverá priorizar desempenho.

As fotografias deverão:

* Ser comprimidas quando necessário.
* Utilizar formatos modernos quando apropriado.
* Possuir dimensões adequadas.
* Utilizar lazy loading quando apropriado.

Evitar:

* Bibliotecas desnecessárias.
* Animações pesadas.
* Vídeos automáticos.
* Assets excessivamente grandes.

A qualidade visual das fotos da clínica deverá ser preservada sempre que possível.

---

# 34. Regras de Design

O design deverá seguir estas regras:

* Branco como cor predominante.
* Verde da identidade como cor de destaque.
* Marrom da árvore como cor complementar.
* Espaçamento generoso.
* Tipografia elegante e legível.
* Componentes com aparência moderna.
* Bordas e sombras discretas.
* Animações suaves.
* Fotografia real da clínica.
* Fotografia real da Grace.
* Elementos naturais inspirados na árvore.

Evitar:

* Visual excessivamente tecnológico.
* Neon.
* Excesso de gradientes.
* Animações exageradas.
* Excesso de elementos na tela.
* Imagens genéricas quando houver fotografia real disponível.
* Alterações arbitrárias da identidade visual.

---

# 35. Regras para a IA / Antigravity

A IA deverá seguir estas regras durante o desenvolvimento.

## Regra 1 — Implementar uma etapa por vez

Não implementar várias funcionalidades grandes simultaneamente sem solicitação.

## Regra 2 — Não inventar informações

Não inventar:

* Horários.
* Preços.
* Formação.
* Especializações.
* Serviços.
* Dados de contato.
* Informações clínicas.

## Regra 3 — Preservar identidade visual

Não alterar a identidade visual sem autorização.

## Regra 4 — Preservar assets oficiais

A árvore fornecida é um asset oficial.

Não recriar ou substituir a árvore sem autorização.

## Regra 5 — Utilizar fotografias reais

Quando houver uma fotografia real adequada, priorizá-la em vez de utilizar imagens genéricas.

## Regra 6 — Não implementar videochamada

Consultas online serão realizadas através de videochamada externa.

## Regra 7 — Segurança

Não expor:

* API keys.
* Secrets.
* Tokens.
* Credenciais.
* Dados administrativos.

## Regra 8 — Não modificar arquitetura sem justificativa

Se uma mudança arquitetural for necessária, explicar o motivo antes de implementá-la.

## Regra 9 — Código limpo

Priorizar:

* TypeScript.
* Componentes reutilizáveis.
* Separação de responsabilidades.
* Nomes claros.
* Código legível.
* Tipagem adequada.

## Regra 10 — Responsividade

Toda interface deverá ser testada para desktop e mobile.

## Regra 11 — Acessibilidade

Toda interface deverá considerar acessibilidade desde a implementação.

## Regra 12 — Não adicionar dependências desnecessárias

Antes de instalar uma biblioteca, avaliar se ela é realmente necessária.

---

# 36. Roadmap de Desenvolvimento

## Sprint 0 — Planejamento e Setup

* [x] Criar repositório/pasta do projeto.
* [x] Criar PROJECT_BRIEF.md.
* [x] Inicializar projeto Next.js (16.3.8).
* [x] Configurar TypeScript.
* [x] Configurar Tailwind CSS v4.
* [x] Configurar estrutura inicial de diretórios.
* [x] Configurar Git.
* [x] Criar README.md com documentação oficial do projeto.

---

## Sprint 1 — Identidade Visual e Base do Website

* [x] Definir design tokens (verde, branco, madeira suave).
* [x] Definir paleta inspirada nos materiais reais da clínica.
* [x] Configurar tipografia.
* [x] Adicionar árvore oficial da clínica.
* [x] Adicionar fotografias reais do gabinete e da psicóloga.
* [x] Criar Header institucional responsivo.
* [x] Criar Footer institucional com navegação e direitos.
* [x] Criar sistema de navegação suave por âncoras.
* [x] Criar layout responsivo mobile-first.

---

## Sprint 2 — Homepage

* [x] Hero com apresentação visual de acolhimento.
* [x] Frase principal de Jean-Paul Sartre.
* [x] Apresentação da Dra. Grace Azevedo da Graça.
* [x] Abordagem terapêutica (Sistémica e TCC).
* [x] Áreas de atuação (ansiedade, depressão, burnout, PHDA, etc.).
* [x] Tipos de atendimento (adultos, casais, famílias, infanto-juvenil).
* [x] Consultório e galeria de fotos reais.
* [x] Atendimento presencial e online (Videochamada).
* [x] CTA de agendamento online.
* [x] Seção de contacto e WhatsApp direto.
* [x] Footer institucional.

---

## Sprint 3 — Conteúdo Institucional

* [x] Biografia profissional da Dra. Grace.
* [x] Formação académica (Universidade Estácio de Sá).
* [x] Especializações (Terapia Familiar e de Casal, abordagem Sistémica).
* [x] Experiência profissional (>10 anos).
* [x] Abordagens clínicas documentadas.
* [x] Áreas de intervenção apresentadas com rigor clínico.
* [x] Missão institucional.
* [x] Valores profissionais e respeito pela meta-ética.

---

## Sprint 4 — Localização e Contato

* [x] Seção "Onde estamos" com foto real da fachada e placa.
* [x] Endereço completo do gabinete em Ovar.
* [x] Integração de mapa interativo / direções.
* [x] Botões diretos para WhatsApp (+351 926 362 033).
* [x] E-mail institucional.
* [x] Ligação ao Instagram profissional (@grcpsi).
* [x] Formulário de contacto e pedido de agendamento.

---

## Sprint 5 — Sistema de Agendamento Online

* [x] Modelagem de slots de consulta de 1 hora (`09:00` às `20:00`).
* [x] Seleção de modalidade: Consulta Presencial (Ovar) ou Consulta Online (Videochamada).
* [x] Calendário mensal interativo com bloqueio de datas passadas.
* [x] Verificação dinâmica de horários disponíveis no fuso `Europe/Lisbon`.
* [x] Formulário de contacto do utente com sanitização e validação server-side.
* [x] Consentimento RGPD obrigatório com carimbo temporal.
* [x] Resumo de conferência antes da confirmação.
* [x] Persistência atómica no Supabase com status `pending`.

---

## Sprint 6 — Backend e Área Administrativa

* [x] Configuração de projeto e cliente Supabase (PostgreSQL).
* [x] Migrations SQL com tabelas `appointments` e `availability_schedules`.
* [x] Políticas rigorosas de Row Level Security (RLS) e hardening de privilégios.
* [x] Autenticação administrativa com Supabase Auth.
* [x] Proteção de rotas `/admin` com Next.js Middleware e validação de `ADMIN_EMAIL`.
* [x] Painel de gestão de consultas (`AppointmentsManager`) com visualização, confirmação, cancelamento e notas.
* [x] Gestão de disponibilidade (`DateOverridesManager`) para bloqueio de dias e exceções horárias.

---

## Sprint 7 — WhatsApp e Notificações (Resend)

* [x] Integração de botões e links de WhatsApp institucional.
* [x] Fluxo de confirmação pós-agendamento.
* [x] Sistema de notificações transacionais por e-mail com Resend.
* [x] Templates em HTML responsivo (PT-PT) para utente e administração.
* [x] Isolamento seguro de chaves de API (`RESEND_API_KEY`) no servidor.

---

## Sprint 8 — Chatbot [ADIADO / PÓS-LANÇAMENTO]

> **STATUS:** **ADIADO / FORA DO ESCOPO DO LANÇAMENTO ATUAL.**
>
> O desenvolvimento do assistente virtual por IA não será realizado nesta etapa e não constitui pré-requisito para o lançamento do website.
> As especificações conceituais e limites clínicos encontram-se preservadas na Secção 23 para eventual consideração futura.

---

## Sprint 9 — Qualidade & Production Readiness (Phase 9)

* [x] **Phase 9.1 — Auditoria de Production Readiness:** Concluída. Mapeamento de vulnerabilidades, lint e requisitos de lançamento.
* [x] **Phase 9.2 — Segurança & Correções Técnicas:** Concluída. Atualização do Next.js para a versão de patch 16.4.6 (resolvendo CVEs e alertas do `npm audit`), limpeza de warning no lint e integridade do lockfile.
* [x] **Phase 9.3 — SEO & Acessibilidade:** Concluída. Proteção em `app/robots.ts` impedindo indexação de `/admin` e `/admin/`; associação semântica de `htmlFor` e `id` no formulário de marcação.
* [x] **Phase 9.4 — Documentação & Alinhamento:** Concluída. Alinhamento bilingue de README.md, PROJECT_BRIEF.md e AGENTS.md com a realidade do projeto.
* [x] **Phase 9.5 — Preparação para Deploy:** Concluída. Verificação de build de produção, checklist de variáveis de ambiente de produção e domínio.
* [x] **Phase 9.6 — Validação Final Pré-Lançamento:** Concluída. Smoke tests finais de rotas, formulários, notificações Resend e limpeza da base de dados de produção.

---

## Sprint 10 — Lançamento e Publicação em Produção

* [x] Configurar domínio próprio de produção (`grcpsi.pt`).
* [x] Configurar projeto de produção na Vercel com DNS definitivo.
* [x] Configurar domínio e remetente corporativo verificado no Resend (`notificacoes@grcpsi.pt`).
* [x] Configurar variáveis de ambiente definitivas de produção.
* [x] Testes de validação finais em produção (smoke tests).
* [x] Publicação oficial e abertura ao público.

---

# 37. Futuro — Flutter App

Após o website e backend estarem em produção e consolidados:

* [ ] Criar projeto Flutter.
* [ ] Definir arquitetura mobile (MVVM).
* [ ] Conectar ao backend Supabase existente.
* [ ] Autenticação.
* [ ] Home e perfil da profissional.
* [ ] Agendamento de consultas.
* [ ] Histórico e próximas consultas.
* [ ] Contacto direto via WhatsApp.
* [ ] FAQ.
* [ ] Notificações push.
* [ ] Chatbot (se implementado posteriormente).
* [ ] Publicação nas lojas Google Play e Apple App Store.

---

# 38. Princípio Geral do Projeto

O objetivo é construir um produto digital profissional para a clínica da Grace Azevedo da Graça.

O projeto deverá priorizar:

**Confiança + Acolhimento + Simplicidade + Profissionalismo + Segurança**

A tecnologia deverá servir à experiência do paciente e da psicóloga.

O website não deverá parecer um projeto genérico gerado automaticamente por IA.

A identidade, as fotografias, a árvore, as informações profissionais e a experiência real da clínica deverão ser os elementos centrais do produto.

---

# 39. Estado Atual

## Informações
* [x] Informações profissionais e credenciais OPP/EuroPsy validadas.
* [x] Informações da clínica e endereço físico em Ovar validados.
* [x] Serviços, abordagens e especialidades definidos.
* [x] Regras de agendamento e horários implementados.
* [x] Política de privacidade e conformidade RGPD implementadas.

## Assets
* [x] Fotografias profissionais da psicóloga integradas.
* [x] Fotografias reais da clínica, sala e espaço infantil integradas.
* [x] Fotografia da fachada com placa da clínica integrada.
* [x] Árvore oficial da identidade visual integrada no header, footer e elementos de design.

## Desenvolvimento de Software
* [x] Projeto Next.js 16.4.6 estruturado com TypeScript e Tailwind CSS v4.
* [x] Repositório Git com histórico rigoroso de commits e branches.
* [x] Frontend responsivo completo com todas as seções institucionais.
* [x] Sistema de agendamento online funcional com prevenção de conflitos.
* [x] Base de dados PostgreSQL no Supabase com RLS ativado.
* [x] Autenticação e painel administrativo `/admin` funcional.
* [x] Provedor de e-mails transacionais via Resend com templates em PT-PT.
* [x] Página de política de privacidade `/privacidade` e consentimento RGPD.
* [x] SEO e regras de `robots.txt` para proteção da área administrativa.
* [x] Chatbot: **ADIADO / FORA DO ESCOPO DO LANÇAMENTO INICIAL**.
* [x] Deploy em produção (`https://grcpsi.pt`).

---

# 40. Regra Final

Antes de implementar qualquer funcionalidade importante, consultar este documento.

Se uma decisão não estiver definida neste documento e puder afetar:

* arquitetura;
* segurança;
* identidade visual;
* banco de dados;
* experiência do paciente;
* agendamento;
* área administrativa;

a decisão deverá ser discutida antes da implementação.

O `PROJECT_BRIEF.md` representa a fonte principal de requisitos do projeto.
