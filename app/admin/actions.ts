"use server";

import {
  createServerClientInstance,
  createServerSupabaseAdminClient,
} from "@/lib/supabase/server";

export async function syncAdminUser() {
  try {
    const serverSupabase = await createServerClientInstance();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user || !user.email) {
      return { success: false, error: "Não autenticado." };
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email.toLowerCase() !== adminEmail.toLowerCase()) {
      return { success: false, error: "Não autorizado." };
    }

    // User is verified as the authorized administrator.
    // Securely register the admin in public.admin_users using server-only service role client.
    const adminDb = createServerSupabaseAdminClient();
    const { error } = await (adminDb.from("admin_users") as any).upsert(
      {
        user_id: user.id,
        email: user.email.toLowerCase(),
      },
      { onConflict: "email" }
    );

    if (error) {
      console.warn("Aviso ao registar admin_users na base de dados:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Erro inesperado em syncAdminUser:", err);
    return { success: false, error: "Erro interno do servidor." };
  }
}
