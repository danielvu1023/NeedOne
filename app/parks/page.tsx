// app/add-park-test/page.tsx
import Navbar from "@/components/ui/navbar";
import AddParkCard from "@/components/ui/add-park-card";
import { AddParkCardSkeleton } from "@/components/ui/add-park-card-skeleton";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import InfoMessage from "@/components/ui/info-message";
import Link from "next/link";

export default async function AddParkTestPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  const userId = data.user.id;
  console.log("userId", userId);
  const { data: parksData, error: parksError } = await supabase
    .from("parks")
    .select();

  if (parksError) {
    throw new Error("Failed to fetch parks");
  }
  let parks = parksData ?? [];

  if (!parks || parks.length === 0) {
    return (
      <InfoMessage title="No Parks Available">
        It seems there are no parks available at the moment. Please check back
        later or contact support.
      </InfoMessage>
    );
  }
  const { data: parkUsersData, error: parkUsersError } = await supabase
    .from("park_users")
    .select()
    .eq("user_id", userId);
  if (parkUsersError) {
    throw new Error("Failed to fetch parks");
  }
  let parkUsers = parkUsersData ?? [];
  const addedParkIds = new Set(parkUsers.map((p) => p.park_id));
  const parksToAdd = parks.filter((park) => !addedParkIds.has(park.id));
  if (parksToAdd.length === 0) {
    return (
      <InfoMessage title="All Parks Added">
        You have already added all available parks. Check your profile for more
        details.
      </InfoMessage>
    );
  }
  return (
    <div className="min-w-80 max-w-[728px] mx-auto">
      <Navbar />
      <div className="pt-20 p-4 space-y-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4 hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-md text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Parks
          </Link>
          <h1 className="text-2xl font-bold mb-2">Add Parks</h1>
          <p className="text-muted-foreground">
            Find and add parks to your list
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {parksToAdd.map((park) => (
            <AddParkCard key={park.id} park={park} />
          ))}
        </div>
      </div>
    </div>
  );
}
