"use client";
import React, { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  MoreVertical,
  Grid3X3,
  Zap,
  Sun,
  Home,
  Lock,
  Timer,
  Wifi,
  WifiOff,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

// Custom time formatter for sec/min display
const formatTimeAgoShort = (timestamp: string | null) => {
  if (!timestamp) return "N/A";

  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  }
};

interface ParkCardProps {
  park?: {
    id: number;
    name: string;
    location: string;
    isActive?: boolean;
    currentPlayers?: number;
    maxPlayers?: number;
    lastActivity?: string;
    reportedPlayers?: number;
    hasModeratorReport?: boolean;
    lastReportTime?: string;
    tags?: {
      courts: number;
      net: "permanent" | "bring-own";
      environment: "outdoor" | "indoor";
      access: "public" | "private";
    };
  };
  isCheckedIn?: boolean;
  onCheckIn?: () => void;
  isDisabled?: boolean;
  checkedInParkName?: string;
}

const ParkCard: FC<ParkCardProps> = ({
  park,
  isCheckedIn = false,
  onCheckIn,
  isDisabled = false,
  checkedInParkName,
}) => {
  const [isPending, setIsPending] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showModeratorInput, setShowModeratorInput] = useState(false);
  const [moderatorCount, setModeratorCount] = useState(
    park.latest_report_count || 0
  );
  const checkInCount = park.active_check_in_count;
  const courtCapacity = park.courts * 4;

  // Determine if park is online based on activity
  const isOnline =
    checkInCount > 0 ||
    (park.latest_report_count && park.latest_report_count > 0);
  // Mock data if no park prop provided
  const mockPark = park || {
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
  };

  const handleCheckIn = () => {
    if (onCheckIn) {
      setIsPending(true);
      setTimeout(() => {
        onCheckIn();
        setIsPending(false);
      }, 1000);
    }
  };

  const handleDisabledClick = () => {
    if (isDisabled && checkedInParkName) {
      alert(
        `You must check out of "${checkedInParkName}" before you can check into another park.`
      );
    }
  };

  const handleRemovePark = () => {
    setIsRemoving(true);
    setTimeout(() => {
      alert(`Park "${park.name}" removed from your list!`);
      setIsRemoving(false);
    }, 1000);
  };

  const handleModeratorUpdate = () => {
    if (moderatorCount) {
      alert(`Player count updated to ${moderatorCount} by moderator`);
      setShowModeratorInput(false);
      setModeratorCount("");
    }
  };

  return (
    <TooltipProvider>
      <Card
        className={`park-card transition-all duration-200 hover:shadow-lg ${
          isCheckedIn ? "ring-2 ring-primary ring-offset-2" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-poppins font-semibold">
              {park.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={isOnline ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                <span className="hidden min-[425px]:inline">
                  {isOnline ? "Online" : "Offline"}
                </span>
                <span className="min-[425px]:hidden">
                  {isOnline ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                </span>
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isRemoving}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setShowModeratorInput(!showModeratorInput)}
                    className="focus:bg-blue-50"
                  >
                    Moderator Update
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleRemovePark}
                    className="text-destructive focus:text-destructive"
                  >
                    {isRemoving ? "Removing..." : "Remove from list"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground font-inter">
            <MapPin className="h-5 w-5 mr-2" />
            {park.location}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1 font-inter"
            >
              <Grid3X3 className="h-3 w-3" />
              <span className="font-jetbrains-mono">{park.courts}</span> courts
            </Badge>
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1 font-inter"
            >
              <Zap className="h-3 w-3" />
              {park.net === "permanent" ? "Permanent net" : "Bring own net"}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1 font-inter"
            >
              {park.environment === "outdoor" ? (
                <>
                  <Sun className="h-3 w-3" />
                  Outdoor
                </>
              ) : (
                <>
                  <Home className="h-3 w-3" />
                  Indoor
                </>
              )}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs flex items-center gap-1 font-inter"
            >
              {park.access === "public" ? (
                <>
                  <Users className="h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center font-inter">
              <Users className="h-5 w-5 mr-2" />
              <span>
                <span className="font-jetbrains-mono font-semibold player-count">
                  {checkInCount}/{courtCapacity}
                </span>{" "}
                players
              </span>
            </div>
            <div className="flex items-center text-muted-foreground font-inter">
              <Clock className="h-4 w-4 mr-1" />
              <span className="time-display text-xs">
                {formatTimeAgoShort(park.latest_check_in_time)} ago
              </span>
            </div>
          </div>

          {/* Queue display when over capacity */}
          {checkInCount > courtCapacity && (
            <div className="flex items-center text-sm font-inter">
              <Timer className="h-4 w-4 mr-2" />
              <span className="font-jetbrains-mono font-semibold">
                {checkInCount - courtCapacity}
              </span>
              <span className="ml-1 ">queued</span>
            </div>
          )}

          {/* Capacity bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground font-inter">
              <span>Capacity</span>
              <span className="font-jetbrains-mono">
                {Math.round((checkInCount / courtCapacity) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  checkInCount / courtCapacity >= 1
                    ? "bg-red-500"
                    : checkInCount / courtCapacity >= 0.6
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(
                    (checkInCount / courtCapacity) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Moderator reported count and capacity bar */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 font-inter">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="relative touch-manipulation">
                    <Users className="h-5 w-5" />
                    <ShieldCheck className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-inter">
                    Player count verified by park moderators
                  </p>
                </TooltipContent>
              </Tooltip>
              <span>
                <span className="font-jetbrains-mono font-semibold player-count">
                  {moderatorCount}/{courtCapacity}
                </span>{" "}
                players
              </span>
              {moderatorCount !== 0 && (
                <Badge
                  variant="outline"
                  className="text-xs font-inter flex items-center gap-1"
                >
                  <span className="hidden min-[425px]:inline">Verified</span>
                  <span className="min-[425px]:hidden">
                    <ShieldCheck className="h-3 w-3" />
                  </span>
                </Badge>
              )}
            </div>
            <div className="flex items-center text-muted-foreground font-inter">
              <Clock className="h-4 w-4 mr-1" />
              <span className="time-display text-xs">
                {formatTimeAgoShort(park.latest_report_created_at)} ago
              </span>
            </div>
          </div>

          {/* Queue display for moderator count when over capacity */}
          {moderatorCount > courtCapacity && (
            <div className="flex items-center text-sm font-inter">
              <Timer className="h-4 w-4 mr-2" />
              <span className="font-jetbrains-mono font-semibold">
                {moderatorCount - courtCapacity}
              </span>
              <span className="ml-1 ">queued</span>
            </div>
          )}

          {/* Moderator reported capacity bar */}
          <div className="space-y-1 mb-5">
            <div className="flex justify-between text-xs text-muted-foreground font-inter">
              <span>Reported Capacity</span>
              <span className="font-jetbrains-mono">
                {Math.round((moderatorCount / courtCapacity) * 100)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  moderatorCount / courtCapacity >= 1
                    ? "bg-red-500"
                    : moderatorCount / courtCapacity >= 0.6
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(
                    (moderatorCount / courtCapacity) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Moderator Input */}
          {showModeratorInput && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 font-poppins">
                  Moderator Update
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Player count"
                  value={moderatorCount}
                  onChange={(e) => setModeratorCount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleModeratorUpdate}
                  size="sm"
                  disabled={!moderatorCount}
                >
                  Update
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={isDisabled ? handleDisabledClick : handleCheckIn}
            disabled={isPending}
            className="w-full"
            variant={
              isCheckedIn ? "outline" : isDisabled ? "secondary" : "default"
            }
          >
            {isPending
              ? "Loading..."
              : isCheckedIn
              ? "Check Out"
              : isDisabled
              ? "Check in disabled"
              : "Check In"}
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ParkCard;
