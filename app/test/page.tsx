// app/test/page.js
"use client";
import Navbar from "@/components/ui/navbar";
import ParkCard from "@/components/ui/park-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function TestPage() {
  const router = useRouter();

  return (
    <div className="min-w-80 max-w-[728px] mx-auto">
      <Navbar />
      <div className="pt-20 p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Parks</h1>
            <p className="text-muted-foreground">
              Your added parks and their current activity
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push("/add-park-test")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Parks
            </Button>
            <Button
              onClick={() => router.push("/moderator-create-park")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Park
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {mockParks.map((park) => (
            <ParkCard key={park.id} park={park} />
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Default Mock Card</h2>
          <div className="max-w-md">
            <ParkCard />
          </div>
        </div>
      </div>
    </div>
  );
}
