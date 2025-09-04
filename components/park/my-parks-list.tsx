"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import ParkCard from "../ui/park-card";

export function MyParksList({ parks }) {
  const [checkedInParkId, setCheckedInParkId] = useState(null);

  const { data: parkUsersData, error: parkUsersError } = use(parks);
  const userParks = parkUsersData || [];

  // 2. useEffect to synchronize server state to local state
  useEffect(() => {
    // Make sure we have parks to check
    if (userParks && userParks.length > 0) {
      // Get the "Server Truth" from the first park.
      // (Since it's the same value for every park in the list)
      const serverCheckedInId = userParks[0]?.currently_checked_in_park_id;

      // Update the local "Client Truth" to match the server.
      setCheckedInParkId(serverCheckedInId);
    }
  }, [userParks]); // 3. Dependency array: This effect runs whenever userParks changes.

  // This handler is for USER INTERACTIONS after the initial load. It's still needed.
  const handleCheckInStateChange = (parkId) => {
    if (checkedInParkId === parkId) {
      setCheckedInParkId(null);
    } else {
      if (!checkedInParkId) {
        setCheckedInParkId(parkId);
      }
    }
  };

  if (!parks || parks.length === 0) {
    return <p>No parks found.</p>;
  }

  if (parkUsersError) {
    return (
      <div className="border-l-4 border-destructive p-4 bg-destructive/10 rounded-md">
        <h3 className="font-bold text-destructive">Could not load parks</h3>
        <p className="text-sm text-muted-foreground">
          There was a problem fetching your parks. Please try again later.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {userParks.map((park) => {
        const checkedInPark = userParks.find((p) => p.id === checkedInParkId);
        return (
          <ParkCard
            key={park.id}
            park={park}
            isCheckedIn={checkedInParkId === park.id}
            onCheckIn={() => handleCheckInStateChange(park.id)}
            isDisabled={checkedInParkId !== null && checkedInParkId !== park.id}
            checkedInParkName={checkedInPark?.name}
          />
        );
      })}
    </div>
  );
}
