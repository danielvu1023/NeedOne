"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import ParkCard from "../ui/park-card";

export function MyParksList({ parks }) {
  const [checkedInParkId, setCheckedInParkId] = useState(null);

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

  if (!parks || parks.length === 0) {
    return <p>No parks found.</p>;
  }

  const { data: parkUsersData, error: parkUsersError } = use(parks);
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
  const userParks = parkUsersData || [];
  return (
    <div className="flex flex-col gap-4">
      {userParks.map((park) => {
        const checkedInPark = userParks.find((p) => p.id === checkedInParkId);
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
  );
}
