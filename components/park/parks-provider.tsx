"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export interface Park {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  playerCount: number;
  moderatorCount?: number; // Added moderator-reported count
  maxCapacity: number;
  lastActivity: Date;
}

export interface CheckIn {
  id: string;
  parkId: string;
  userId: string;
  userName: string;
  checkedInAt: Date;
  checkedOutAt?: Date;
}

export interface CreateParkData {
  name: string;
  location: string;
  description: string;
  maxCapacity: number;
  amenities: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ParksContextType {
  parks: Park[];
  checkIns: CheckIn[];
  userParks: string[]; // Added user's personal park list
  loading: boolean;
  checkInToPark: (parkId: string) => Promise<void>;
  checkOutFromPark: (parkId: string) => Promise<void>;
  getUserCheckInStatus: (parkId: string) => boolean;

  addToMyParks: (parkId: string) => Promise<void>; // Added function to add park to user's list
  removeFromMyParks: (parkId: string) => Promise<void>; // Added function to remove park from user's list
  updateModeratorCount: (parkId: string, count: number) => Promise<void>; // Added moderator count update
}

const ParksContext = createContext<ParksContextType | undefined>(undefined);

// Mock data for parks
const mockParks: Park[] = [
  {
    id: "1",
    name: "Central Park Basketball Court",
    location: "Downtown District",
    isActive: true,
    playerCount: 8,
    moderatorCount: 0, // Initialize moderator count
    maxCapacity: 20,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: "2",
    name: "Riverside Soccer Field",
    location: "Riverside Area",
    isActive: true,
    playerCount: 12,
    moderatorCount: 0, // Initialize moderator count
    maxCapacity: 30,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
  {
    id: "3",
    name: "Oak Street Tennis Courts",
    location: "Oak Street",
    isActive: false,
    playerCount: 0,
    moderatorCount: 0, // Initialize moderator count
    maxCapacity: 8,
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "4",
    name: "Community Playground",
    location: "Family District",
    isActive: true,
    playerCount: 6,
    moderatorCount: 0, // Initialize moderator count
    maxCapacity: 25,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: "5",
    name: "Skate Park Zone",
    location: "Youth Center",
    isActive: true,
    playerCount: 4,
    moderatorCount: 0, // Initialize moderator count
    maxCapacity: 15,
    lastActivity: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
  },
];

export function ParksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [parks, setParks] = useState<Park[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [userParks, setUserParks] = useState<string[]>([]); // Added user parks state
  const [loading, setLoading] = useState(true);

  const checkInToPark = async (parkId: string) => {
    if (!user) return;

    try {
      const newCheckIn: CheckIn = {
        id: Date.now().toString(),
        parkId,
        userId: user.id,
        userName: user.name,
        checkedInAt: new Date(),
      };

      setCheckIns((prev) => [...prev, newCheckIn]);

      setParks((prev) =>
        prev.map((park) =>
          park.id === parkId
            ? {
                ...park,
                playerCount: park.playerCount + 1,
                checkedInPlayers: [...park.checkedInPlayers, user.id],
                lastActivity: new Date(),
              }
            : park
        )
      );
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  const checkOutFromPark = async (parkId: string) => {
    if (!user) return;

    try {
      setCheckIns((prev) =>
        prev.map((checkIn) =>
          checkIn.parkId === parkId &&
          checkIn.userId === user.id &&
          !checkIn.checkedOutAt
            ? { ...checkIn, checkedOutAt: new Date() }
            : checkIn
        )
      );

      setParks((prev) =>
        prev.map((park) =>
          park.id === parkId
            ? {
                ...park,
                playerCount: Math.max(0, park.playerCount - 1),
                checkedInPlayers: park.checkedInPlayers.filter(
                  (id) => id !== user.id
                ),
                lastActivity: new Date(),
              }
            : park
        )
      );
    } catch (error) {
      console.error("Check-out failed:", error);
    }
  };

  const getUserCheckInStatus = (parkId: string): boolean => {
    if (!user) return false;

    return checkIns.some(
      (checkIn) =>
        checkIn.parkId === parkId &&
        checkIn.userId === user.id &&
        !checkIn.checkedOutAt
    );
  };

  const addToMyParks = async (parkId: string) => {
    if (!user) return;

    try {
      setUserParks((prev) => [...prev, parkId]);
    } catch (error) {
      console.error("Failed to add park to my parks:", error);
    }
  };

  const removeFromMyParks = async (parkId: string) => {
    if (!user) return;

    try {
      setUserParks((prev) => prev.filter((id) => id !== parkId));
    } catch (error) {
      console.error("Failed to remove park from my parks:", error);
    }
  };

  const updateModeratorCount = async (parkId: string, count: number) => {
    if (!user?.isModerator) {
      throw new Error("Only moderators can update counts");
    }

    try {
      setParks((prev) =>
        prev.map((park) =>
          park.id === parkId
            ? { ...park, moderatorCount: count, lastActivity: new Date() }
            : park
        )
      );
    } catch (error) {
      console.error("Failed to update moderator count:", error);
    }
  };

  return (
    <ParksContext.Provider
      value={{
        parks,
        checkIns,
        userParks, // Added userParks to context
        loading,
        checkInToPark,
        checkOutFromPark,
        getUserCheckInStatus,

        addToMyParks, // Added new functions to context
        removeFromMyParks,
        updateModeratorCount,
      }}
    >
      {children}
    </ParksContext.Provider>
  );
}

export function useParks() {
  const context = useContext(ParksContext);
  if (context === undefined) {
    throw new Error("useParks must be used within a ParksProvider");
  }
  return context;
}
