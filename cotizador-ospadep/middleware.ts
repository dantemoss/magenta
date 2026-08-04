import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/planes" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap")
  );
}

function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isPublic = isPublicPath(pathname);

  const env = getSupabaseEnv();
  if (!env) {
    // Sin variables en Vercel/local: no tumbar el middleware (500).
    // Rutas protegidas redirigen al inicio; el cliente mostrará el aviso de config.
    if (!isPublic) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = pathname.startsWith("/admin") ? "/" : "/login";
      if (!pathname.startsWith("/admin")) {
        redirectUrl.searchParams.set("next", pathname);
      }
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  const res = NextResponse.next();

  try {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isPublic) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (user && pathname.startsWith("/admin")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = "/";
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch {
    if (!isPublic) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|fonts/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|ttf|woff|woff2)$).*)",
  ],
};
