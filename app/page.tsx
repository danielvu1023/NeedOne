import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";
import ParkPlayerCount from "@/components/park/park-player-count";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  const userId = data.user.id;
  console.log("userId", userId);
  const { data: parksData, error: parksError } = await supabase
    .from("park_users")
    .select(
      `
      park (
        id,
        name,
        location
      )
    `
    )
    .eq("user_id", userId);
  const parks = parksData?.map((item) => item.park);
  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-center mb-12">
        Welcome to the Park
      </h1>
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        {parks?.map((park) => (
          <ParkPlayerCount key={park.id} park={park} />
        ))}
      </div>
      <Link
        href="/notifications"
        className="mt-8 text-blue-600 hover:underline text-lg"
      >
        Go to Notifications
      </Link>
      <SignOutButton></SignOutButton>
    </div>
  );
}
