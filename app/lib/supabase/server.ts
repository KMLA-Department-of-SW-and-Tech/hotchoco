import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

export function createClient(request: Request) {
  const headers = new Headers();

  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : undefined);
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== "undefined"
      ? process.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY ??
        process.env.VITE_SUPABASE_ANON_KEY
      : undefined);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "") as {
            name: string;
            value: string;
          }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            ),
          );
        },
      },
    },
  );

  return { supabase, headers };
}
