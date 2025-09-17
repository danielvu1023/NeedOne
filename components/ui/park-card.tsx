"use client";
import React, {
  FC,
  use,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import { createClient } from "@/utils/supabase/client";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  User,
  UserPlus,
  X,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import {
  checkInUser,
  checkoutUser,
  deleteParkForUser,
} from "@/app/parks/actions";
import { submitReport } from "@/app/reports/actions";
import { toast } from "sonner";
import { sendFriendRequest } from "@/app/friends/actions";

// Profile Row Component
const ProfileRow = ({
  currentCheckIns,
  currentUserId,
}: {
  currentCheckIns?: Array<{
    fullname: string;
    profile_pic: string | null;
    user_id: string;
    is_friend: boolean;
    has_pending_request: boolean;
    verified?: boolean;
  }>;
  currentUserId?: string | null;
}) => {
  if (!currentCheckIns || currentCheckIns.length === 0) {
    return null;
  }

  const maxVisible = 5;

  // Sort to show friends first
  const sortedCheckIns = [...currentCheckIns].sort((a, b) => {
    if (a.is_friend && !b.is_friend) return -1;
    if (!a.is_friend && b.is_friend) return 1;
    return 0;
  });

  const visibleUsers = sortedCheckIns.slice(0, maxVisible);
  const remainingCount = sortedCheckIns.length - maxVisible;

  return (
    <div className="flex items-center gap-1 py-1">
      {visibleUsers.map((user) => {
        const initials = user.fullname
          .split(" ")
          .map((name) => name.charAt(0).toUpperCase())
          .join("")
          .slice(0, 2);

        return (
          <Tooltip key={user.user_id}>
            <TooltipTrigger asChild>
              <div className="relative">
                {user.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt={user.fullname}
                    className={`w-7 h-7 rounded-full object-cover shadow-sm ${
                      user.user_id === currentUserId
                        ? "border-2 border-blue-500"
                        : user.is_friend
                        ? "border-2 border-green-500"
                        : ""
                    }`}
                  />
                ) : (
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm ${
                    user.user_id === currentUserId
                      ? "border-2 border-blue-500"
                      : user.is_friend
                      ? "border-2 border-green-500"
                      : ""
                  }`}>
                    {initials}
                  </div>
                )}
                {user.verified && (
                  <div className="absolute -top-1 -right-1">
                    <ShieldCheck className="h-3 w-3 text-yellow-500" />
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {user.fullname}
                {user.user_id === currentUserId ? " (You)" : ""}
                {user.is_friend ? " (Friend)" : ""}
                {user.verified ? " (Verified)" : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {remainingCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 border-dashed flex items-center justify-center text-gray-500 text-xs font-medium ml-1">
              •••
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              +{remainingCount} more user{remainingCount > 1 ? "s" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

// Add Friend Button Component with individual loading state
const AddFriendButton = ({
  userId,
  hasPendingRequest,
}: {
  userId: string;
  hasPendingRequest: boolean;
}) => {
  const [isPending, startTransition] = useTransition();

  const handleAddFriend = () => {
    if (hasPendingRequest) return;

    startTransition(async () => {
      try {
        const result = await sendFriendRequest(userId);

        if (!result.success) {
          toast.error(
            result.message || "Failed to add friend. Please try again."
          );
        } else {
          toast.success(result.message || "Friend added successfully.");
        }
      } catch (e) {
        console.error("Add friend failed:", e);
        toast.error(
          "A network error occurred while adding friend. Please try again."
        );
      }
    });
  };

  if (hasPendingRequest) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled
        className="flex items-center gap-1"
      >
        <Clock className="h-3 w-3" />
        Pending
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleAddFriend}
      className="flex items-center gap-1"
      disabled={isPending}
    >
      <UserPlus className="h-3 w-3" />
      {isPending ? "Adding..." : "Add Friend"}
    </Button>
  );
};

// Player List Modal Component
const PlayerListModal = ({
  isOpen,
  onClose,
  currentCheckIns,
  parkName,
  currentUserId,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentCheckIns?: Array<{
    fullname: string;
    profile_pic: string | null;
    user_id: string;
    is_friend: boolean;
    has_pending_request: boolean;
    verified?: boolean;
  }>;
  parkName: string;
  currentUserId?: string | null;
}) => {
  if (!currentCheckIns || currentCheckIns.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              People at {parkName}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>No one is currently checked in at this park.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Filter out current user and sort to show friends first
  const filteredCheckIns = currentCheckIns.filter((user) => user.user_id !== currentUserId);
  const friends = filteredCheckIns.filter((user) => user.is_friend);
  const nonFriends = filteredCheckIns.filter((user) => !user.is_friend);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="pt-4">
          <DialogTitle className="text-lg text-center">
            People at {parkName}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {/* Friends Section */}
          {friends.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs text-muted-foreground px-2">
                  Friends ({friends.length})
                </span>
                <div className="h-px bg-border flex-1" />
              </div>
              <div className="space-y-2">
                {friends.map((user) => {
                  const initials = user.fullname
                    .split(" ")
                    .map((name) => name.charAt(0).toUpperCase())
                    .join("")
                    .slice(0, 2);

                  return (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.profile_pic ? (
                            <img
                              src={user.profile_pic}
                              alt={user.fullname}
                              className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold border-2 border-green-500">
                              {initials}
                            </div>
                          )}
                          {user.verified && (
                            <div className="absolute -top-1 -right-1">
                              <ShieldCheck className="h-4 w-4 text-yellow-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.fullname}</p>
                          <p className="text-xs text-green-600">
                            Friend{user.verified ? " • Verified" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Players Section */}
          {nonFriends.length > 0 && (
            <div>
              {friends.length > 0 && (
                <div className="flex items-center gap-2 mb-3 mt-4">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs text-muted-foreground px-2">
                    Other Players ({nonFriends.length})
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>
              )}
              <div className="space-y-2">
                {nonFriends.map((user) => {
                  const initials = user.fullname
                    .split(" ")
                    .map((name) => name.charAt(0).toUpperCase())
                    .join("")
                    .slice(0, 2);

                  return (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.profile_pic ? (
                            <img
                              src={user.profile_pic}
                              alt={user.fullname}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                              {initials}
                            </div>
                          )}
                          {user.verified && (
                            <div className="absolute -top-1 -right-1">
                              <ShieldCheck className="h-4 w-4 text-yellow-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.fullname}</p>
                          {user.verified && (
                            <p className="text-xs text-yellow-600">Verified</p>
                          )}
                        </div>
                      </div>
                      <AddFriendButton
                        userId={user.user_id}
                        hasPendingRequest={user.has_pending_request}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ParkCardProps {
  park: {
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
    current_check_ins?: Array<{
      fullname: string;
      profile_pic: string | null;
      user_id: string;
      is_friend: boolean;
      has_pending_request: boolean;
      verified?: boolean;
    }>;
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
const submitReportInitialState = {
  success: false,
  message: "",
};
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
  const [showPlayerList, setShowPlayerList] = useState(false);

  const moderatorCount = park.latest_report_count || 0;
  const [isCheckInPending, startCheckInTransition] = useTransition();
  const [isRemovingPark, startRemovingParkTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const checkInCount = park.active_check_in_count;
  const courtCapacity = park.courts * 4;

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Mock data for testing profile row with 8 users (including current user)
  const mockCurrentCheckIns = park.current_check_ins || [
    {
      fullname: "Current User (You)",
      profile_pic: null,
      user_id: currentUserId || "current-user",
      is_friend: false,
      has_pending_request: false,
      verified: true,
    },
    {
      fullname: "John Doe",
      profile_pic:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      user_id: "1",
      is_friend: true,
      has_pending_request: false,
      verified: true,
    },
    {
      fullname: "Jane Smith",
      profile_pic: null,
      user_id: "2",
      is_friend: false,
      has_pending_request: true,
      verified: false,
    },
    {
      fullname: "Mike Johnson",
      profile_pic:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      user_id: "3",
      is_friend: true,
      has_pending_request: false,
      verified: false,
    },
    {
      fullname: "Sarah Wilson",
      profile_pic: null,
      user_id: "4",
      is_friend: false,
      has_pending_request: false,
      verified: true,
    },
    {
      fullname: "David Brown",
      profile_pic:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      user_id: "5",
      is_friend: false,
      has_pending_request: false,
      verified: false,
    },
    {
      fullname: "Emma Davis",
      profile_pic: null,
      user_id: "6",
      is_friend: true,
      has_pending_request: false,
      verified: true,
    },
    {
      fullname: "Alex Chen",
      profile_pic:
        "https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face",
      user_id: "7",
      is_friend: false,
      has_pending_request: true,
      verified: false,
    },
  ];

  // Determine if park is online based on activity
  const isOnline =
    checkInCount > 0 ||
    (park.latest_report_count && park.latest_report_count > 0);
  const submitReportWithParkId = submitReport.bind(null, park.id);
  const [submitReportState, submitReportFormAction, submitReportPending] =
    useActionState(submitReportWithParkId, submitReportInitialState);
  console.log("submitReportState", submitReportState);
  useEffect(() => {
    if (submitReportState.message) {
      if (submitReportState.success) {
        console.log("it ran");
        toast.success(submitReportState.message);
      } else {
        toast.error(submitReportState.message);
      }
    }
  }, [submitReportState]);
  const handleRemovePark = () => {
    startRemovingParkTransition(async () => {
      try {
        const result = await deleteParkForUser(park.id);

        if (!result.success) {
          toast.error(
            result.message || "Failed to remove park. Please try again."
          );
          return;
        } else {
          toast.success(result.message || "Park removed from your list.");
        }
      } catch (e) {
        console.error("Remove park failed:", e);
        setError(
          "A network error occurred while removing the park. Please try again."
        );
      }
    });
  };

  const handleToggleCheckIn = () => {
    startCheckInTransition(async () => {
      debugger;
      const parkId = park.id.toString();

      try {
        // Wrap getCurrentPosition in a Promise to make it awaitable
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        debugger;
        const userLongitude = position.coords.longitude;
        const userLatitude = position.coords.latitude;

        const result = isCheckedIn
          ? await checkoutUser(parkId)
          : await checkInUser(parkId, userLongitude, userLatitude);

        if (!result.success) {
          setError(
            result.message ||
              "There was an error checking in/out. Please try again."
          );
          return; // Stop if the server reported a controlled error
        }

        if (onCheckIn) {
          onCheckIn();
        }
      } catch (error: any) {
        let errorMessage = "Unable to retrieve location.";
        if (error.code) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
        }
        setError(errorMessage);
      }
    });
  };

  const handleDisabledClick = () => {
    if (isDisabled && checkedInParkName) {
      alert(
        `You must check out of "${checkedInParkName}" before you can check into another park.`
      );
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
                    onClick={() => setShowPlayerList(true)}
                    className="focus:bg-blue-50"
                  >
                    View people at park
                  </DropdownMenuItem>
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
                    {isRemovingPark ? "Removing..." : "Remove from list"}
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
                {formatTimeAgo(park.latest_check_in_time)}
              </span>
            </div>
          </div>

          {/* Profile Row - Current Check-ins */}
          <ProfileRow currentCheckIns={mockCurrentCheckIns} currentUserId={currentUserId} />

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
                {formatTimeAgo(park.latest_report_created_at)}
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
              <form className="flex gap-2" action={submitReportFormAction}>
                <Input
                  type="number"
                  placeholder="Player count"
                  className="flex-1"
                  name="moderatorCount"
                />
                <Button
                  type="submit"
                  disabled={submitReportPending || !moderatorCount}
                >
                  {submitReportPending ? "Updating..." : "Update"}
                </Button>
              </form>
            </div>
          )}

          <Button
            onClick={isDisabled ? handleDisabledClick : handleToggleCheckIn}
            disabled={isCheckInPending}
            className="w-full"
            variant={
              isCheckedIn ? "outline" : isDisabled ? "secondary" : "default"
            }
          >
            {isCheckInPending
              ? "Loading..."
              : isCheckedIn
              ? "Check Out"
              : isDisabled
              ? "Check in disabled"
              : "Check In"}
          </Button>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 font-inter">
              {error}
            </div>
          )}

          {/* Player List Modal */}
          <PlayerListModal
            isOpen={showPlayerList}
            onClose={() => setShowPlayerList(false)}
            currentCheckIns={mockCurrentCheckIns}
            parkName={park.name}
            currentUserId={currentUserId}
          />
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ParkCard;
