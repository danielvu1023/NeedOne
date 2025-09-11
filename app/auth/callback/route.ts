import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Email confirmation successful, redirect to the home page or intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
  }


  // Return the user to an error page with some instructions if something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth-callback-error`);
}