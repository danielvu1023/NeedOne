import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Users } from "lucide-react";
import GoogleSignInButton from "./auth/google-sign-in-button";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className={cn("w-full max-w-sm", className)} {...props}>
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary rounded-full p-3">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to NeedOne
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Connect with local sports communities
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-500 mb-4">
                Sign in to get started
              </div>

              <GoogleSignInButton />

              <div className="text-center text-xs text-gray-400 mt-6">
                By signing in, you agree to our terms of service and privacy
                policy
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
