"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { createClient } from "@/utils/supabase/client"; // Your Supabase client setup

import { Park } from "@/lib/types";
import { checkoutUser, deleteParkForUser } from "@/app/parks/actions";

// This component takes the ID of the park it should track as a prop.
const ParkPlayerCount = ({ park }: { park: Park }) => {
  const supabase = createClient();
  const [playerCount, setPlayerCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const parkId = park.id;
  // A memoized function to get the accurate count from the database
  const fetchParkCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("check_in") // Your table name from Prisma
      .select("*", { count: "exact", head: true })
      .eq("park_id", parkId);
    console.log("count", count);
    if (error) {
      console.error(`Error fetching count for park ${parkId}:`, error);
    } else {
      setPlayerCount(count ?? 0);
    }
  }, [supabase, parkId]);
  const handleDeletePark = () => {
    startTransition(async () => {
      console.log("parkId", parkId);
      const response = await deleteParkForUser(parkId);
      if (response.success) {
        alert(response.message || "Park deleted successfully!");
      } else {
        alert(
          response.message || "Failed to delete park. Please try again later."
        );
      }
    });
  };
  const handleCheckoutUser = () => {
    startTransition(async () => {
      const response = await checkoutUser(parkId);
      if (response.success) {
        alert(response.message || "Successfully checked out from park!");
      } else {
        alert(
          response.message ||
            "Failed to checkout from park. Please try again later."
        );
      }
    });
  };
  // This useEffect handles the initial load and the realtime subscription
  useEffect(() => {
    let isMounted = true;

    // Wrap async logic in an IIFE
    (async () => {
      // 1. Initial Data Load
      await fetchParkCount();
      if (isMounted) setIsInitialLoading(false);

      // 2. Realtime Subscription
      const channelName = `parks:${parkId}`;
      await supabase.realtime.setAuth();
      const channel = supabase.channel(channelName, {
        config: { private: true },
      });
      channel
        .on("broadcast", { event: "*" }, (payload) => {
          console.log(`Realtime event for park ${parkId}:`, payload);
          fetchParkCount();
        })
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log(
              `Successfully subscribed to authorized channel: ${channelName}`
            );
          }
          if (status === "CHANNEL_ERROR") {
            console.error(
              `Failed to subscribe to channel ${channelName}. Error:`,
              err
            );
          }
        });

      // 3. Cleanup Function
      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    })();

    // Cleanup for effect
    return () => {
      isMounted = false;
    };
  }, [supabase, parkId, fetchParkCount]);

  // Render Logic
  if (isInitialLoading) {
    return <p>Loading player count...</p>;
  }

  return (
    <div>
      <div className="border rounded-lg p-6 shadow-md flex flex-col gap-3 bg-white w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">{park.name}</h2>
          <button
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
            onClick={handleDeletePark}
          >
            Delete
          </button>
        </div>
        <p className="text-gray-600 mb-2">Location: {park.location}</p>
        <div className="flex flex-col items-center">
          <h3 className="text-base font-medium">
            Players currently at this park:
          </h3>
          <p className="text-3xl font-bold mt-1">{playerCount}</p>
          <button
            className="mt-2 px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm"
            onClick={handleCheckoutUser}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParkPlayerCount;
