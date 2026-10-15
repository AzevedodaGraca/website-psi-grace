import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

// Server Component / Server Action cookie-aware client factory
export async function createServerClientInstance() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    url.includes("placeholder") ||
    !anonKey ||
    anonKey.includes("placeholder")
  ) {
    throw new Error(
      "Configuração do Supabase (URL ou chave anónima) ausente ou inválida no servidor."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component; handled by middleware
        }
      },
    },
  });
}

// Privileged server-only Supabase client (using service role key)
export function createServerSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !url ||
    url.includes("placeholder") ||
    !serviceRoleKey ||
    serviceRoleKey.includes("placeholder")
  ) {
    throw new Error(
      "Configuração do Supabase (URL ou SERVICE_ROLE_KEY) ausente ou inválida no servidor."
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}
