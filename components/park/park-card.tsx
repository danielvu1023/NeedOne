"use client";

import { useParks, type Park } from "@/components/parks/parks-provider";
import { useAuth } from "@/components/auth/auth-provider";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin,
  Users,
  Clock,
  Wifi,
  WifiOff,
  UserCheck,
  UserX,
  MoreVertical,
  Navigation,
  Plus,
  Minus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ParkCardProps {
  park: Park;
}

export function ParkCard({ park }: ParkCardProps) {
  const {
    checkInToPark,
    checkOutFromPark,
    getUserCheckInStatus,
    addToMyParks,
    removeFromMyParks,
    userParks,
  } = useParks();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isCheckedIn = getUserCheckInStatus(park.id);
  const isInMyParks = userParks.includes(park.id); // Check if park is in user's personal list
  const totalCount = park.playerCount + (park.moderatorCount || 0);
  const capacityPercentage = (totalCount / park.maxCapacity) * 100;

  const handleCheckInOut = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (isCheckedIn) {
        await checkOutFromPark(park.id);
      } else {
        await checkInToPark(park.id);
      }
    } catch (error) {
      console.error("Check-in/out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMyParksToggle = async () => {
    if (!user) return;

    try {
      if (isInMyParks) {
        await removeFromMyParks(park.id);
      } else {
        await addToMyParks(park.id);
      }
    } catch (error) {
      console.error("Failed to update my parks:", error);
    }
  };

  const getCapacityColor = () => {
    if (capacityPercentage >= 90) return "text-destructive";
    if (capacityPercentage >= 70) return "text-yellow-600";
    return "text-primary";
  };

  const getStatusIcon = () => {
    return park.isActive ? (
      <Wifi className="h-4 w-4 text-primary" />
    ) : (
      <WifiOff className="h-4 w-4 text-muted-foreground" />
    );
  };

  return (
    <Card
      className={`park-card transition-all duration-200 ${
        isCheckedIn ? "ring-2 ring-primary ring-offset-2" : ""
      } ${park.isActive ? "hover:shadow-lg" : "opacity-75"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-balance leading-tight">
              {park.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {park.location}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMyParksToggle}>
                  {isInMyParks ? (
                    <>
                      <Minus className="h-4 w-4 mr-2" />
                      Remove from My Parks
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to My Parks
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  View Players
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Player Count and Capacity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${getCapacityColor()}`}>
                {totalCount} / {park.maxCapacity}
              </span>
              {park.moderatorCount && park.moderatorCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {park.playerCount} users + {park.moderatorCount} reported
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(park.lastActivity, { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              capacityPercentage >= 90
                ? "bg-destructive"
                : capacityPercentage >= 70
                ? "bg-yellow-500"
                : "bg-primary"
            }`}
            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
          />
        </div>

        {/* Check-in Button */}
        <Button
          onClick={handleCheckInOut}
          disabled={
            isLoading ||
            !park.isActive ||
            (capacityPercentage >= 100 && !isCheckedIn)
          }
          className="w-full"
          variant={isCheckedIn ? "destructive" : "default"}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          ) : isCheckedIn ? (
            <UserX className="h-4 w-4 mr-2" />
          ) : (
            <UserCheck className="h-4 w-4 mr-2" />
          )}

          {isLoading
            ? "Processing..."
            : isCheckedIn
            ? "Check Out"
            : capacityPercentage >= 100
            ? "Full Capacity"
            : "Check In"}
        </Button>

        {isCheckedIn && (
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              <UserCheck className="h-3 w-3 mr-1" />
              You're checked in
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
