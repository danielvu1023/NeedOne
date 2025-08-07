import { createClient } from "@/utils/supabase/server";

import ParkCard from "@/components/ui/ParkCard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

  async function addPark(parkId: string) {
    "use server";

    const { error } = await supabase
      .from("park_users")
      .insert({ user_id: userId, park_id: parkId });
    if (error) {
      console.error(`Error adding park ${parkId} for user ${userId}:`, error);
      return;
    } else {
      console.log(`Park ${parkId} added for user ${userId}`);
    }

    revalidatePath("/parks");
  }
  console.log("Park users:", parkUsers);
  console.log("Parks to add:", parksToAdd);
  // now we need to filter which parks the user has tracked
  // get all parks with that user id
  // get the park id frmo the query
  // lets filter from there the parks

  // Get tracked parks for the user
  //   let trackedParkIds: number[] = [];
  //   if (userId) {
  //     const tracked = await prisma.park_users.findMany({
  //       where: { user_id: userId },
  //       select: { park_id: true },
  //     });
  //     trackedParkIds = tracked.map((t: any) => t.park_id);
  //   }

  //   async function addParkToTracked(parkId: number) {
  //     "use server";
  //     if (!userId) return;
  //     const exists = await prisma.park_users.findFirst({
  //       where: { park_id: parkId, user_id: userId },
  //     });
  //     if (!exists) {
  //       await prisma.park_users.create({
  //         data: { park_id: parkId, user_id: userId },
  //       });
  //     }
  //   }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {parksToAdd?.map((park) => (
        <ParkCard
          key={park.id}
          name={park.name}
          location={park.location}
          onAdd={() => addPark(park.id)}
        />
      ))}
      {/* {parks.map((park: any) => (
        <form
          key={park.id}
          action={async () => {
            "use server";
            await addParkToTracked(park.id);
          }}
        >
          <ParkCard
            name={park.name}
            location={park.location}
            isTracked={trackedParkIds.includes(park.id)}
            onAdd={() => {}}
          />
        </form>
      ))} */}
    </div>
  );
}
