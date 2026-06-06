import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getStudioAccess } from "@/lib/access";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings");
  const isPortalRoute =
    pathname.startsWith("/portal") && pathname !== "/portal/login";
  const isProAuthPage = pathname === "/login" || pathname === "/signup";
  const isPortalAuthPage = pathname === "/portal/login";

  if (!user && (isProRoute || isPortalRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = isPortalRoute ? "/portal/login" : "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isProAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isPortalAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal";
    return NextResponse.redirect(url);
  }

  // Paywall : essai terminé sans abonnement → on bloque le dashboard (sauf la
  // page d'abonnement, pour permettre de souscrire).
  if (
    user &&
    pathname.startsWith("/dashboard") &&
    pathname !== "/dashboard/billing"
  ) {
    const { data: studio } = await supabase
      .from("studios")
      .select("trial_ends_at, plan_tier, stripe_subscription_id")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (studio && getStudioAccess(studio).locked) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/billing";
      url.searchParams.set("expired", "1");
      return NextResponse.redirect(url);
    }
  }

  return response;
}
