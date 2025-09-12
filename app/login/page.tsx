import { Suspense } from "react";
import OneTapComponent from "@/components/auth/one-tap-component";
import { login, signUp } from "./actions";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
      {/* <OneTapComponent /> */}
    </Suspense>
  );
}
