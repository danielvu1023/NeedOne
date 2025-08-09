"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client"; // Your Supabase client setup

// This component takes the ID of the park it should track as a prop.
const ParkPlayerCount = ({ parkId }: { parkId: number }) => {
  const supabase = createClient();
  const [playerCount, setPlayerCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
      <h3>Players currently at this park:</h3>
      <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{playerCount}</p>
    </div>
  );
};

export default ParkPlayerCount;
