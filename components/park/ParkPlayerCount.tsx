"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client"; // Your Supabase client setup

// This component takes the ID of the park it should track as a prop.
const ParkPlayerCount = ({ parkId }: { parkId: string }) => {
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
    // 1. Initial Data Load
    fetchParkCount().then(() => {
      setIsInitialLoading(false);
    });

    // 2. Realtime Subscription
    const channelName = `parks:${parkId}`;
    const channel = supabase.channel(channelName);

    channel
      .on("broadcast", { event: "CHECK_IN_CHANGE" }, (payload) => {
        console.log(`Realtime event for park ${parkId}:`, payload);
        // On event, re-fetch the source of truth. No loading state needed.
        fetchParkCount();
      })
      .subscribe((status, err) => {
        // This lets you know if the authorization passed or failed
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
      supabase.removeChannel(channel);
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
