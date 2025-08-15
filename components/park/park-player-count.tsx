"use client";
import { useState, useEffect, useCallback, useTransition } from "react";
import { createClient } from "@/utils/supabase/client"; // Your Supabase client setup

import { Park } from "@/lib/types";
import {
  checkoutUser,
  deleteParkForUser,
  getUserCheckInStatus,
  checkInUser,
  getParkReportCount,
} from "@/app/parks/actions";
const LoadingText = () => <div>Loading...</div>;
// This component takes the ID of the park it should track as a prop.
const ParkPlayerCount = ({ park }: { park: Park }) => {
  const supabase = createClient();
  const parkId = park.id;

  const [playerCount, setPlayerCount] = useState(0);
  const [reportedPlayerCount, setReportedPlayerCount] = useState(0);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  // 2. Loading State
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isCheckInOutLoading, setIsCheckInOutLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      // Promise.all runs these two checks concurrently
      const [statusResponse, countResult, reportCountResult] =
        await Promise.all([
          getUserCheckInStatus(parkId),
          supabase
            .from("check_in")
            .select("*", { count: "exact", head: true })
            .eq("park_id", parkId)
            .is("check_out_time", null),
          getParkReportCount(parkId),
        ]);

      // Update state with the results
      if (statusResponse.success && statusResponse.data) {
        setIsCheckedIn(true);
      }
      if (!countResult.error && countResult.count !== null) {
        setPlayerCount(countResult.count);
      }
      if (reportCountResult.success && reportCountResult.data !== null) {
        setReportedPlayerCount(reportCountResult.data ?? 0);
      }
      setIsLoadingInitialData(false);
    };

    loadInitialData();
    (async () => {
      await supabase.realtime.setAuth();

      // --- CHANNEL 1: For Player Check-ins (existing code) ---
      const checkInChannelName = `parks:${parkId}`;
      const checkInChannel = supabase.channel(checkInChannelName, {
        config: { private: true },
      });

      checkInChannel
        .on("broadcast", { event: "*" }, (payload) => {
          console.log(`Realtime check-in event for park ${parkId}:`, payload);
          const fetchCount = async () => {
            const { count } = await supabase
              .from("check_in")
              .select("*", { count: "exact", head: true })
              .eq("park_id", parkId)
              .is("check_out_time", null);
            setPlayerCount(count ?? 0);
          };
          fetchCount();
        })
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log(
              `Successfully subscribed to check-in channel: ${checkInChannelName}`
            );
          }
          if (status === "CHANNEL_ERROR") {
            console.error(
              `Failed to subscribe to channel ${checkInChannelName}. Error:`,
              err
            );
          }
        });

      // --- CHANNEL 2: For Submitted Reports (NEW CODE) ---
      const reportsChannelName = `park_reports:${parkId}`;
      const reportsChannel = supabase.channel(reportsChannelName, {
        config: { private: true },
      });

      reportsChannel
        .on("broadcast", { event: "*" }, (message) => {
          console.log(`New report broadcast for park ${parkId}:`, message);
          // The new report data is in message.payload.new
          const newReport = message.payload.record;
          if (newReport && typeof newReport.report_count === "number") {
            // Update the reported player count state directly from the payload
            setReportedPlayerCount(newReport.report_count);
          }
        })
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log(
              `Successfully subscribed to reports channel: ${reportsChannelName}`
            );
          }
          if (status === "CHANNEL_ERROR") {
            console.error(
              `Failed to subscribe to channel ${reportsChannelName}. Error:`,
              err
            );
          }
        });

      // --- UPDATED Cleanup Function ---
      // This now cleans up both channels when the component unmounts
      return () => {
        supabase.removeChannel(checkInChannel);
        supabase.removeChannel(reportsChannel); // Make sure to remove the new channel
      };
    })();
  }, [supabase, parkId]);
  // A memoized function to get the accurate count from the database
  // const fetchParkCount = useCallback(async () => {
  //   const { count, error } = await supabase
  //     .from("check_in")
  //     .select("*", { count: "exact", head: true })
  //     // Condition 1: Match the specific park
  //     .eq("park_id", parkId)
  //     // Condition 2: Only include rows where the user has not checked out yet
  //     .is("check_out_time", null);
  //   console.log("count", count);
  //   if (error) {
  //     console.error(`Error fetching count for park ${parkId}:`, error);
  //   } else {
  //     setPlayerCount(count ?? 0);
  //   }
  // }, [supabase, parkId]);
  const handleDeletePark = async () => {
    setIsDeleteLoading(true);
    setMessage(null);
    const response = await deleteParkForUser(parkId);
    setMessage({
      text: response.message || "Action complete.",
      success: response.success,
    });
    // Note: If deletion is successful, the parent component should handle removing this component from the UI.
    setIsDeleteLoading(false);
  };
  const handleCheckoutUser = async () => {
    setIsCheckInOutLoading(true);
    setMessage(null);
    const response = await checkoutUser(parkId);
    setMessage({
      text: response.message || "Action complete.",
      success: response.success,
    });
    if (response.success) {
      setIsCheckedIn(false);
    }
    setIsCheckInOutLoading(false);
  };

  const handleCheckIn = async () => {
    setIsCheckInOutLoading(true);
    setMessage(null);
    const response = await checkInUser(parkId);
    setMessage({
      text: response.message || "Action complete.",
      success: response.success,
    });
    if (response.success) {
      setIsCheckedIn(true);
    }
    setIsCheckInOutLoading(false);
  };

  // // const handleCheckoutUser = async () => {
  // //   setIsCheckInOutLoading(true);
  // //   setMessage(null);
  // //   const response = await checkoutUser(parkId);
  // //   setMessage({
  // //     text: response.message || "Action complete.",
  // //     success: response.success,
  // //   });
  // //   if (response.success) {
  // //     setIsCheckedIn(false);
  // //   }
  // //   setIsCheckInOutLoading(false);
  // // };

  //       setIsCheckedIn(false);
  //     } else {
  //       alert(
  //         response.message ||
  //           "Failed to checkout from park. Please try again later."
  //       );
  //     }
  //   });
  // };

  // const handleCheckIn = () => {
  //   startTransition(async () => {
  //     const response = await checkInUser(parkId);
  //     if (response.success) {
  //       alert(response.message || "Successfully checked in to park!");
  //       setIsCheckedIn(true);
  //     } else {
  //       alert(
  //         response.message ||
  //           "Failed to check in to park. Please try again later."
  //       );
  //     }
  //   });
  // };

  // useEffect(() => {
  //   const checkInStatus = async () => {
  //     const { success, data } = await getUserCheckInStatus(parkId);
  //     // If the call is successful and data is truthy, user is checked in
  //     if (success && data) {
  //       setIsCheckedIn(true);
  //     } else {
  //       setIsCheckedIn(false);
  //     }
  //   };
  //   checkInStatus();
  // }, [parkId]);
  // // This useEffect handles the initial load and the realtime subscription
  // useEffect(() => {
  //   let isMounted = true;

  //   // Wrap async logic in an IIFE
  //   (async () => {
  //     // 1. Initial Data Load
  //     await fetchParkCount();
  //     if (isMounted) setIsInitialLoading(false);

  //     // 2. Realtime Subscription
  //     const channelName = `parks:${parkId}`;
  //     await supabase.realtime.setAuth();
  //     const channel = supabase.channel(channelName, {
  //       config: { private: true },
  //     });
  //     channel
  //       .on("broadcast", { event: "*" }, (payload) => {
  //         console.log(`Realtime event for park ${parkId}:`, payload);
  //         fetchParkCount();
  //       })
  //       .subscribe((status, err) => {
  //         if (status === "SUBSCRIBED") {
  //           console.log(
  //             `Successfully subscribed to authorized channel: ${channelName}`
  //           );
  //         }
  //         if (status === "CHANNEL_ERROR") {
  //           console.error(
  //             `Failed to subscribe to channel ${channelName}. Error:`,
  //             err
  //           );
  //         }
  //       });

  //     // 3. Cleanup Function
  //     return () => {
  //       isMounted = false;
  //       supabase.removeChannel(channel);
  //     };
  //   })();

  //   // Cleanup for effect
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [supabase, parkId, fetchParkCount]);

  // Render Logic
  if (isLoadingInitialData) {
    return <p>Loading park details...</p>;
  }

  return (
    <div className="border rounded-lg p-6 shadow-md flex flex-col gap-3 bg-white w-full max-w-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{park.name}</h2>
        <button
          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm disabled:opacity-50"
          onClick={handleDeletePark}
          disabled={isDeleteLoading || isCheckInOutLoading}
        >
          {isDeleteLoading ? <LoadingText /> : "Delete"}
        </button>
      </div>
      <p className="text-gray-600 mb-2">Location: {park.location}</p>
      <div className="flex flex-col items-center">
        <h3 className="text-base font-medium">
          Players currently at this park:
        </h3>
        <p className="text-3xl font-bold mt-1">{playerCount}</p>
        <h3 className="text-base font-medium">
          Reported Players at this park:
        </h3>
        <p className="text-3xl font-bold mt-1">{reportedPlayerCount}</p>
        {isCheckedIn ? (
          <button
            className="mt-2 px-4 py-2 w-28 h-10 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm disabled:opacity-50 flex items-center justify-center"
            onClick={handleCheckoutUser}
            disabled={isCheckInOutLoading || isDeleteLoading}
          >
            {isCheckInOutLoading ? <LoadingText /> : "Check Out"}
          </button>
        ) : (
          <button
            className="mt-2 px-4 py-2 w-28 h-10 rounded bg-green-600 text-white hover:bg-green-700 text-sm disabled:opacity-50 flex items-center justify-center"
            onClick={handleCheckIn}
            disabled={isCheckInOutLoading || isDeleteLoading}
          >
            {isCheckInOutLoading ? <LoadingText /> : "Check In"}
          </button>
        )}
      </div>
      {message && (
        <p
          className={`mt-2 text-sm ${
            message.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default ParkPlayerCount;
