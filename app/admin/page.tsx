import ReportForm from "@/components/reports/report-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (!data || error) {
    redirect("/");
  }
  const userRole = data.claims?.user_role ?? "Unknown";
  if (userRole !== "moderator") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <ReportForm />
    </div>
  );
}
