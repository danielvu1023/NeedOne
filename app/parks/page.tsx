import { createClient } from "@/utils/supabase/server";

import ParkCard from "@/components/ui/park-card";
import { redirect } from "next/navigation";
import InfoMessage from "@/components/ui/info-message";
export default async function ParksPage() {
  // Get user session from Supabase
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const userId = data.user.id;
  const { data: parksData, error: parksError } = await supabase
    .from("park")
    .select();

  if (parksError) {
    throw new Error("Failed to fetch parks");
  }
  let parks = parksData ?? [];
  if (parks.length === 0) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parksToAdd?.map((park) => (
        <ParkCard key={park.id} park={park} />
      ))}
    </div>
  );
}
