import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Callback OAuth / magic link / email confirmation Supabase
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Si on a un `next` explicite, on l'utilise (cas magic link portail client)
  if (explicitNext) {
    return NextResponse.redirect(`${origin}${explicitNext}`);
  }

  // Sinon, routing intelligent : si l'user est owner d'un studio → dashboard pro,
  // sinon → portail client.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: studio } = await supabase
      .from("studios")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (studio) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    return NextResponse.redirect(`${origin}/portal`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
