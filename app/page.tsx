// app/test/page.js
import { AppLayout } from "@/components/layout/app-layout";
import ParkCard from "@/components/ui/park-card";
import { ParkCardSkeleton } from "@/components/ui/park-card-skeleton";
// import { Button, buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { MyParksList } from "@/components/park/my-parks-list";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/dist/client/components/navigation";

const mockParks = [
  {
    id: 1,
    name: "Central Basketball Court",
    location: "Downtown Park, Main Street",
    isActive: true,
    currentPlayers: 8,
    maxPlayers: 10,
    lastActivity: "2 mins ago",
    reportedPlayers: 9,
    hasModeratorReport: true,
    lastReportTime: "1 min ago",
    tags: {
      courts: 4,
      net: "permanent",
      environment: "outdoor",
      access: "public",
    },
  },
  {
    id: 2,
    name: "Westside Tennis Courts",
    location: "Westside Recreation Center",
    isActive: false,
    currentPlayers: 0,
    maxPlayers: 8,
    lastActivity: "1 hour ago",
    reportedPlayers: 0,
    hasModeratorReport: false,
    lastReportTime: "2 hours ago",
    tags: {
      courts: 6,
      net: "bring-own",
      environment: "indoor",
      access: "private",
    },
  },
  {
    id: 3,
    name: "Riverside Soccer Field",
    location: "Riverside Park, Oak Avenue",
    isActive: true,
    currentPlayers: 14,
    maxPlayers: 22,
    lastActivity: "just now",
    reportedPlayers: 16,
    hasModeratorReport: true,
    lastReportTime: "30 secs ago",
    tags: {
      courts: 2,
      net: "permanent",
      environment: "outdoor",
      access: "public",
    },
  },
  {
    id: 4,
    name: "Community Volleyball Court",
    location: "Community Center, Pine Street",
    isActive: true,
    currentPlayers: 6,
    maxPlayers: 12,
    lastActivity: "5 mins ago",
    reportedPlayers: 7,
    hasModeratorReport: false,
    lastReportTime: "10 mins ago",
    tags: {
      courts: 3,
      net: "bring-own",
      environment: "outdoor",
      access: "public",
    },
  },
];

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  const userId = data.user.id;

  const userParks = supabase.rpc("get_parks_with_check_ins", {
    p_user_id: userId,
  });

  return (
    <AppLayout>
      <div className="min-w-80 max-w-[728px] mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Parks</h1>
            <p className="text-muted-foreground">
              Your added parks and their current activity
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {/* <Link
              href="/parks"
              className={buttonVariants({
                className: "flex items-center gap-2",
              })}
            >
              <Plus className="h-4 w-4" />
              Add Parks
            </Link>
            <Link
              href="/moderator-create-park"
              className={buttonVariants({
                variant: "outline",
                className: "flex items-center gap-2",
              })}
              <Plus className="h-4 w-4" />
              Create Park
            </Link> */}
          </div>
        </div>
        <Suspense fallback={<ParkCardSkeleton />}>
          <MyParksList parks={userParks} />
        </Suspense>
      </div>
    </AppLayout>
  );
}

// import { SignOutButton } from "@/components/auth/sign-out-button";
// import Link from "next/link";
// import ParkPlayerCount from "@/components/park/park-player-count";
// import { createClient } from "@/utils/supabase/server";
// import { redirect } from "next/navigation";

// export default async function Home() {
//   const supabase = await createClient();
//   const { data, error } = await supabase.auth.getUser();
//   if (error || !data?.user) {
//     redirect("/login");
//   }
//   const userId = data.user.id;
//   console.log("userId", userId);
//   const { data: parksData, error: parksError } = await supabase
//     .from("park_users")
//     .select(
//       `
//       park (
//         id,
//         name,
//         location
//       )
//     `
//     )
//     .eq("user_id", userId);
//   const parks = parksData?.map((item) => item.park);
//   return (
//     <div className="font-sans min-h-screen p-8 pb-20 sm:p-20 flex flex-col items-center">
//       <h1 className="text-4xl font-bold text-center mb-12">
//         Welcome to the Park
//       </h1>
//       <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
//         {parks?.map((park) => (
//           <ParkPlayerCount key={park.id} park={park} />
//         ))}
//       </div>
//       <div className="mt-8 flex flex-col items-center gap-4">
//         <Link
//           href="/test"
//           className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
//         >
//           Go to My Parks (Test)
//         </Link>
//         <Link
//           href="/notifications"
//           className="text-blue-600 hover:underline text-lg"
//         >
//           Go to Notifications
//         </Link>
//         <SignOutButton></SignOutButton>
//       </div>
//     </div>
//   );
// }
