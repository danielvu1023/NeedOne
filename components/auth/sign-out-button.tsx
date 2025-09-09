// components/auth/SignOutButton.tsx

"use client"; // This is the most important line!

import { redirect, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Your client-side Supabase instance
// import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { signOut } from "@/app/login/actions";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const handleSignOut = async () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        {isPending ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
