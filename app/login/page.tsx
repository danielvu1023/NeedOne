import OneTapComponent from "@/components/auth/one-tap-component";
import { login, signUp } from "./actions";
import { LoginForm } from "@/components/login-form";
export default function LoginPage() {
  return (
    <>
      <LoginForm />
      {/* <OneTapComponent /> */}
    </>
  );
}
