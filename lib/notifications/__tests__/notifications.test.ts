import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  formatResendFromAddress,
  isValidEmailAddress,
  sanitizeReplyToAddress,
  EmailNotificationProvider,
  type ResendSendEmailParams,
} from "../providers/email";
import {
  escapeHtml,
  formatModalityPt,
  resolveAdminNotificationEmail,
  DEFAULT_ADMIN_NOTIFICATION_EMAIL,
  buildAdminNewBookingNotification,
  buildPatientNewBookingNotification,
  buildPatientConfirmedNotification,
  buildPatientCancelledNotification,
} from "../templates";
import {
  dispatchAppointmentCreatedNotifications,
  dispatchAppointmentConfirmedNotification,
  dispatchAppointmentCancelledNotification,
} from "../service";
import type { AppointmentNotificationPayload } from "../types";

const samplePayload: AppointmentNotificationPayload = {
  id: "11111111-2222-3333-4444-555555555555",
  appointment_type: "online",
  appointment_date: "2026-11-20",
  time_slot: "10:00",
  patient_name: "Maria Silva",
  patient_email: "maria.silva@example.com",
  patient_phone: "+351 912 345 678",
  patient_notes: "Prefiro horário da manhã.",
  status: "pending",
};

describe("Integração de E-mails Resend — Website Psi-Grace", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.NOTIFICATION_FROM_EMAIL;
    delete process.env.RESEND_FROM_NAME;
    delete process.env.ADMIN_NOTIFICATION_EMAIL;
    delete process.env.ADMIN_EMAILS;
    delete process.env.ADMIN_EMAIL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("1. Formatação e validação do remetente (from)", () => {
    it("combina RESEND_FROM_EMAIL simples com RESEND_FROM_NAME", () => {
      const formatted = formatResendFromAddress(
        "notificacoes@grcpsi.pt",
        "Psicóloga Grace Azevedo da Graça"
      );
      assert.equal(
        formatted,
        "Psicóloga Grace Azevedo da Graça <notificacoes@grcpsi.pt>"
      );
    });

    it("usa apenas o endereço quando RESEND_FROM_NAME não é definido", () => {
      const formatted = formatResendFromAddress("notificacoes@grcpsi.pt", "");
      assert.equal(formatted, "notificacoes@grcpsi.pt");
    });

    it("não duplica nomes nem sinais < > se RESEND_FROM_EMAIL já vier formatado", () => {
      const alreadyFormatted =
        "Psicóloga Grace Azevedo da Graça <notificacoes@grcpsi.pt>";
      const formatted = formatResendFromAddress(
        alreadyFormatted,
        "Psicóloga Grace Azevedo da Graça"
      );
      assert.equal(
        formatted,
        "Psicóloga Grace Azevedo da Graça <notificacoes@grcpsi.pt>"
      );
    });

    it("aplica RESEND_FROM_NAME se RESEND_FROM_EMAIL vier apenas entre < > sem nome", () => {
      const formatted = formatResendFromAddress(
        "<notificacoes@grcpsi.pt>",
        "Psicóloga Grace Azevedo da Graça"
      );
      assert.equal(
        formatted,
        "Psicóloga Grace Azevedo da Graça <notificacoes@grcpsi.pt>"
      );
    });

    it("rejeita endereços de remetente malformados ou inválidos", () => {
      assert.equal(formatResendFromAddress("invalido-sem-arroba", "Grace"), null);
      assert.equal(
        formatResendFromAddress("Grace <<notificacoes@grcpsi.pt>>", "Grace"),
        null
      );
      assert.equal(
        formatResendFromAddress("notificacoes@grcpsi.pt\r\nBcc:a@b.c", "Grace"),
        null
      );
      assert.equal(formatResendFromAddress("", "Grace"), null);
    });
  });

  describe("2. Configuração do destinatário administrativo", () => {
    it("usa gracepsi@hotmail.com por defeito quando ADMIN_NOTIFICATION_EMAIL não está definida", () => {
      assert.equal(DEFAULT_ADMIN_NOTIFICATION_EMAIL, "gracepsi@hotmail.com");
      assert.equal(resolveAdminNotificationEmail(), "gracepsi@hotmail.com");
    });

    it("prioriza a variável de ambiente ADMIN_NOTIFICATION_EMAIL quando configurada", () => {
      process.env.ADMIN_NOTIFICATION_EMAIL = "gracepsi@hotmail.com";
      assert.equal(resolveAdminNotificationEmail(), "gracepsi@hotmail.com");

      process.env.ADMIN_NOTIFICATION_EMAIL = "  Agenda@grcpsi.pt ";
      assert.equal(resolveAdminNotificationEmail(), "agenda@grcpsi.pt");
    });

    it("ignora valores inválidos em ADMIN_NOTIFICATION_EMAIL e faz fallback seguro para gracepsi@hotmail.com", () => {
      process.env.ADMIN_NOTIFICATION_EMAIL = "email-invalido";
      assert.equal(resolveAdminNotificationEmail(), "gracepsi@hotmail.com");
    });
  });

  describe("3. Funcionamento e validação do Reply-To", () => {
    it("define Reply-To como gracepsi@hotmail.com nos e-mails enviados ao paciente", () => {
      const pendingMsg = buildPatientNewBookingNotification(samplePayload);
      const confirmedMsg = buildPatientConfirmedNotification(samplePayload);
      const cancelledMsg = buildPatientCancelledNotification(samplePayload);

      assert.equal(pendingMsg.replyTo, "gracepsi@hotmail.com");
      assert.equal(confirmedMsg.replyTo, "gracepsi@hotmail.com");
      assert.equal(cancelledMsg.replyTo, "gracepsi@hotmail.com");
    });

    it("define Reply-To como o e-mail do paciente no e-mail enviado à psicóloga", () => {
      const adminMsg = buildAdminNewBookingNotification(
        samplePayload,
        "gracepsi@hotmail.com"
      );
      assert.equal(adminMsg.replyTo, "maria.silva@example.com");
    });

    it("bloqueia endereços inválidos ou maliciosos no campo Reply-To", () => {
      assert.equal(sanitizeReplyToAddress("nao-e-um-email"), undefined);
      assert.equal(
        sanitizeReplyToAddress("attacker@example.com\r\nBcc:victim@example.com"),
        undefined
      );
      assert.equal(sanitizeReplyToAddress("<script>@example.com"), undefined);

      const invalidPatientPayload: AppointmentNotificationPayload = {
        ...samplePayload,
        patient_email: "invalido@@example..com",
      };
      const adminMsg = buildAdminNewBookingNotification(
        invalidPatientPayload,
        "gracepsi@hotmail.com"
      );
      assert.equal(adminMsg.replyTo, undefined);
      assert.equal( isValidEmailAddress("invalido@@example..com"), false);
    });
  });

  describe("4. Escape HTML dos dados introduzidos pelo paciente", () => {
    it("escapa corretamente caracteres especiais com escapeHtml", () => {
      const raw = `<script>alert("xss")</script> & 'teste'`;
      const escaped = escapeHtml(raw);
      assert.equal(
        escaped,
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;teste&#39;"
      );
    });

    it("escapa patient_name, patient_email, patient_phone e patient_notes nos templates HTML sem quebrar a estrutura", () => {
      const maliciousPayload: AppointmentNotificationPayload = {
        ...samplePayload,
        patient_name: `João <img src=x onerror="alert(1)"> & Cia`,
        patient_email: `joao"teste@example.com`,
        patient_phone: `+351 912 <script>345</script>`,
        patient_notes: `Nota com <b>HTML</b> & "aspas" e 'apóstrofos'`,
      };

      const adminMsg = buildAdminNewBookingNotification(
        maliciousPayload,
        "gracepsi@hotmail.com"
      );
      const patientNewMsg = buildPatientNewBookingNotification(maliciousPayload);
      const patientConfMsg = buildPatientConfirmedNotification(maliciousPayload);
      const patientCancMsg = buildPatientCancelledNotification(maliciousPayload);

      for (const msg of [adminMsg, patientNewMsg, patientConfMsg, patientCancMsg]) {
        assert.ok(msg.bodyHtml);
        assert.ok(!msg.bodyHtml.includes(`<img src=x`));
        assert.ok(!msg.bodyHtml.includes(`<script>345</script>`));
        assert.ok(
          msg.bodyHtml.includes(
            `João &lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; Cia`
          )
        );
      }

      assert.ok(adminMsg.bodyHtml);
      assert.ok(!adminMsg.bodyHtml.includes(`<b>HTML</b>`));
      assert.ok(
        adminMsg.bodyHtml.includes(
          `Nota com &lt;b&gt;HTML&lt;/b&gt; &amp; &quot;aspas&quot; e &#39;apóstrofos&#39;`
        )
      );
      assert.ok(adminMsg.bodyHtml.includes(`joao&quot;teste@example.com`));
      assert.ok(
        adminMsg.bodyHtml.includes(`+351 912 &lt;script&gt;345&lt;/script&gt;`)
      );
    });
  });

  describe("5. Descrição correta das consultas online via WhatsApp", () => {
    it("indica videochamada através do WhatsApp em formatModalityPt e nos templates", () => {
      const onlineModality = formatModalityPt("online");
      assert.equal(onlineModality.title, "Consulta Online");
      assert.equal(onlineModality.location, "Videochamada através do WhatsApp");

      const newBookingMsg = buildPatientNewBookingNotification(samplePayload);
      const confirmedMsg = buildPatientConfirmedNotification(samplePayload);

      assert.ok(newBookingMsg.bodyText.includes("Videochamada através do WhatsApp"));
      assert.ok(newBookingMsg.bodyHtml?.includes("Videochamada através do WhatsApp"));

      assert.ok(
        confirmedMsg.bodyText.includes(
          "A consulta online será realizada por videochamada através do WhatsApp no horário agendado."
        )
      );
      assert.ok(
        confirmedMsg.bodyHtml?.includes(
          "A consulta online será realizada por videochamada através do WhatsApp no horário agendado."
        )
      );
      assert.ok(!confirmedMsg.bodyText.includes("plataforma a combinar"));
      assert.ok(!confirmedMsg.bodyHtml?.includes("plataforma a combinar"));
    });
  });

  describe("6. Fluxo completo de envio (pedido recebido, confirmação e cancelamento) com mock Resend", () => {
    it("envia e-mail para gracepsi@hotmail.com e comprovativo de pedido pendente para o paciente ao criar marcação", async () => {
      process.env.RESEND_API_KEY = "re_test_mock_key_do_not_expose";
      process.env.RESEND_FROM_EMAIL = "notificacoes@grcpsi.pt";
      process.env.RESEND_FROM_NAME = "Psicóloga Grace Azevedo da Graça";
      process.env.ADMIN_NOTIFICATION_EMAIL = "gracepsi@hotmail.com";

      const capturedCalls: ResendSendEmailParams[] = [];
      const mockEmailProvider = new EmailNotificationProvider(async (params) => {
        capturedCalls.push(params);
        return { data: { id: `mock-id-${capturedCalls.length}` }, error: null };
      });

      const results = await dispatchAppointmentCreatedNotifications(samplePayload, {
        emailProvider: mockEmailProvider,
      });

      assert.equal(capturedCalls.length, 2);

      // 1. E-mail enviado à psicóloga
      const adminCall = capturedCalls[0];
      assert.equal(
        adminCall.from,
        "Psicóloga Grace Azevedo da Graça <notificacoes@grcpsi.pt>"
      );
      assert.deepEqual(adminCall.to, ["gracepsi@hotmail.com"]);
      assert.equal(adminCall.replyTo, "maria.silva@example.com");
      assert.ok(adminCall.subject.includes("[Nova Marcação] Maria Silva"));

      // 2. E-mail enviado ao paciente (apenas receção do pedido, pendente de confirmação)
      const patientCall = capturedCalls[1];
      assert.equal(
        patientCall.from,
        "Psicóloga Grace Azevedo da Graça <notificacoes@grcpsi.pt>"
      );
      assert.deepEqual(patientCall.to, ["maria.silva@example.com"]);
      assert.equal(patientCall.replyTo, "gracepsi@hotmail.com");
      assert.equal(
        patientCall.subject,
        "Recebemos o seu pedido de marcação — Psicóloga Grace Azevedo da Graça"
      );
      assert.ok(patientCall.text.includes("pendente de confirmação"));
      assert.ok(patientCall.html?.includes("pendente de confirmação"));
      assert.ok(!patientCall.text.includes("foi confirmada com sucesso"));

      const emailResults = results.filter((r) => r.channel === "email");
      assert.equal(emailResults.length, 2);
      assert.ok(emailResults.every((r) => r.delivered && r.status === "delivered"));
    });

    it("envia e-mail de consulta confirmada e cancelada com remetente e Reply-To corretos", async () => {
      process.env.RESEND_API_KEY = "re_test_mock_key_do_not_expose";
      process.env.RESEND_FROM_EMAIL = "notificacoes@grcpsi.pt";
      process.env.RESEND_FROM_NAME = "Psicóloga Grace Azevedo da Graça";

      const capturedCalls: ResendSendEmailParams[] = [];
      const mockEmailProvider = new EmailNotificationProvider(async (params) => {
        capturedCalls.push(params);
        return { data: { id: `mock-id-${capturedCalls.length}` }, error: null };
      });

      const confirmedResults = await dispatchAppointmentConfirmedNotification(
        { ...samplePayload, status: "confirmed" },
        { emailProvider: mockEmailProvider }
      );
      const cancelledResults = await dispatchAppointmentCancelledNotification(
        { ...samplePayload, status: "cancelled" },
        { emailProvider: mockEmailProvider }
      );

      assert.equal(capturedCalls.length, 2);

      // Confirmação
      assert.equal(
        capturedCalls[0].from,
        "Psicóloga Grace Azevedo da Graça <notificacoes@grcpsi.pt>"
      );
      assert.deepEqual(capturedCalls[0].to, ["maria.silva@example.com"]);
      assert.equal(capturedCalls[0].replyTo, "gracepsi@hotmail.com");
      assert.ok(capturedCalls[0].subject.includes("Consulta Confirmada"));
      assert.ok(confirmedResults[0].delivered);

      // Cancelamento
      assert.equal(
        capturedCalls[1].from,
        "Psicóloga Grace Azevedo da Graça <notificacoes@grcpsi.pt>"
      );
      assert.deepEqual(capturedCalls[1].to, ["maria.silva@example.com"]);
      assert.equal(capturedCalls[1].replyTo, "gracepsi@hotmail.com");
      assert.ok(capturedCalls[1].subject.includes("Cancelada"));
      assert.ok(cancelledResults[0].delivered);
    });
  });
});
