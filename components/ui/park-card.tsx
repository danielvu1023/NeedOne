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
import { MapPin, Users, Clock, ShieldCheck, MoreVertical, Grid3X3, Zap, Sun, Home, Lock } from "lucide-react";

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
      net: 'permanent' | 'bring-own';
      environment: 'outdoor' | 'indoor';
      access: 'public' | 'private';
    };
  };
}

const ParkCard: FC<ParkCardProps> = ({ park }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showModeratorInput, setShowModeratorInput] = useState(false);
  const [moderatorCount, setModeratorCount] = useState("");

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
      net: 'permanent',
      environment: 'outdoor',
      access: 'public'
    },
  };

  const handleCheckIn = () => {
    setIsPending(true);
    setTimeout(() => {
      setIsCheckedIn(!isCheckedIn);
      setIsPending(false);
    }, 1000);
  };

  const handleRemovePark = () => {
    setIsRemoving(true);
    setTimeout(() => {
      alert(`Park "${mockPark.name}" removed from your list!`);
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
            <CardTitle className="text-lg">{mockPark.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={mockPark.isActive ? "default" : "secondary"}>
                {mockPark.isActive ? "Active" : "Inactive"}
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
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-5 w-5 mr-2" />
            {mockPark.location}
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Grid3X3 className="h-3 w-3" />
              {mockPark.tags?.courts} courts
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {mockPark.tags?.net === 'permanent' ? 'Permanent net' : 'Bring own net'}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {mockPark.tags?.environment === 'outdoor' ? (
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
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {mockPark.tags?.access === 'public' ? (
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
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>
                {mockPark.currentPlayers}/{mockPark.maxPlayers} players
              </span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{mockPark.lastActivity}</span>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Capacity</span>
              <span>
                {Math.round(
                  (mockPark.currentPlayers / mockPark.maxPlayers) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  mockPark.currentPlayers / mockPark.maxPlayers >= 1
                    ? "bg-red-500"
                    : mockPark.currentPlayers / mockPark.maxPlayers >= 0.6
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${
                    (mockPark.currentPlayers / mockPark.maxPlayers) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Moderator reported count and capacity bar */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="relative touch-manipulation">
                    <Users className="h-5 w-5" />
                    <ShieldCheck className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Player count verified by park moderators</p>
                </TooltipContent>
              </Tooltip>
              <span>
                {mockPark.reportedPlayers}/{mockPark.maxPlayers} players
              </span>
              {mockPark.hasModeratorReport && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{mockPark.lastReportTime}</span>
            </div>
          </div>

          {/* Moderator reported capacity bar */}
          <div className="space-y-1 mb-5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Reported Capacity</span>
              <span>
                {Math.round(
                  (mockPark.reportedPlayers / mockPark.maxPlayers) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  mockPark.reportedPlayers / mockPark.maxPlayers >= 1
                    ? "bg-red-500"
                    : mockPark.reportedPlayers / mockPark.maxPlayers >= 0.6
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${
                    (mockPark.reportedPlayers / mockPark.maxPlayers) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Moderator Input */}
          {showModeratorInput && (
            <div className="space-y-2 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Moderator Update</span>
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
            onClick={handleCheckIn}
            disabled={isPending}
            className="w-full"
            variant={isCheckedIn ? "outline" : "default"}
          >
            {isPending ? "Loading..." : isCheckedIn ? "Check Out" : "Check In"}
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ParkCard;
