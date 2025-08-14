"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GoogleSignInButton() {
  const supabase = createClient();
  const router = useRouter();

  async function handleSignInWithGoogle(response: any) {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: response.credential,
    });

    if (error) {
      console.error("Error signing in with Google:", error);

      router.push("/error");
      return;
    }

    router.push("/");
  }
  useEffect(() => {
    console.log("GoogleSignInButton mounted");
    const initializeAndRenderButton = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleSignInWithGoogle,
      });

      const buttonContainer = document.getElementById(
        "google-signin-container"
      );
      if (buttonContainer) {
        window.google.accounts.id.renderButton(buttonContainer, {
          type: "standard",
          shape: "pill",
          theme: "filled_black",
          text: "continue_with",
          size: "large",
          logo_alignment: "left",
        });
      }
    };
    if (window.google) {
      initializeAndRenderButton();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initializeAndRenderButton();
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [router]);

  return (
    <>
      <div id="google-signin-container"></div>
    </>
  );
}
