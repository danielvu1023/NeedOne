// app/test/page.js
"use client";
import { AppLayout } from "@/components/layout/app-layout";
import ParkCard from "@/components/ui/park-card";
import { ParkCardSkeleton } from "@/components/ui/park-card-skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [parks, setParks] = useState([]);
  const [checkedInParkId, setCheckedInParkId] = useState(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setParks(mockParks);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleCheckIn = (parkId) => {
    if (checkedInParkId === parkId) {
      // Check out of current park
      setCheckedInParkId(null);
    } else {
      // Check into new park (only if not checked in anywhere else)
      if (!checkedInParkId) {
        setCheckedInParkId(parkId);
      }
    }
  };

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
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <ParkCardSkeleton key={index} />
              ))
            : parks.map((park) => {
                const checkedInPark = parks.find(p => p.id === checkedInParkId);
                return (
                  <ParkCard 
                    key={park.id} 
                    park={park}
                    isCheckedIn={checkedInParkId === park.id}
                    onCheckIn={() => handleCheckIn(park.id)}
                    isDisabled={checkedInParkId !== null && checkedInParkId !== park.id}
                    checkedInParkName={checkedInPark?.name}
                  />
                );
              })}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Default Mock Card</h2>
          <div className="max-w-md">
            <ParkCard />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
