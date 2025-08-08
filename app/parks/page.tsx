import { createClient } from "@/utils/supabase/server";

import ParkCard from "@/components/ui/ParkCard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addPark } from "./actions";
export default async function ParksPage() {
  // Get user session from Supabase
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  const userId = data.user.id;
  const { data: parks, error: parksError } = await supabase
    .from("park")
    .select();

  if (parksError) {
    console.error("Error fetching parks:", parksError);
  }
  console.log("User ID:", userId);
  console.log("Fetched parks:", parks);
  const { data: parkUsers, error: parkUsersError } = await supabase
    .from("park_users")
    .select()
    .eq("user_id", userId);

  const parkUsersId = parkUsers?.map((parkUser) => parkUser.park_id);
  const parksToAdd = parks?.filter((park) => !parkUsersId?.includes(park.id));

  console.log("Park users:", parkUsers);
  console.log("Parks to add:", parksToAdd);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parksToAdd?.map((park) => (
        <ParkCard
          key={park.id}
          name={park.name}
          location={park.location}
          onAdd={addPark.bind(null, park.id)}
        />
      ))}
    </div>
  );
}
