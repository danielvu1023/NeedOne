"use client";

import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserPlus,
  MapPin,
  Clock,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Trash2,
  LogOut,
} from "lucide-react";
import { cn, formatTimeAgo } from "@/lib/utils";
import { useFriendsPanel } from "@/contexts/friends-panel-context";
import { signOut } from "@/app/login/actions";
import { getFriendsWithStatus } from "@/app/friends/actions";
import { createClient } from "@/utils/supabase/client";

export function FriendsSidePanel({
  initialPendingRequests = [],
  friendsWithStatus = [],
  hasError = false,
}: {
  initialPendingRequests: any[];
  friendsWithStatus?: any[];
  hasError?: boolean;
}) {
  const { isExpanded, setIsExpanded } = useFriendsPanel();
  const [pendingRequests, setPendingRequests] = useState(
    initialPendingRequests
  );
  const [friends, setFriends] = useState(friendsWithStatus);
  const supabase = createClient();
  console.log("pendingRequests", pendingRequests);
  const setupRealtimeSubscription = async () => {
    await supabase.realtime.setAuth();
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session?.user) {
      console.error("Error getting user session:", error);
      return null;
    }
    const userId = data?.session.user.id;
    console.log("Setting up realtime for userId:", userId);

    // Friend Requests Channel
    const friendRequestChannelName = `friend_requests:${userId}`;
    const friendRequestChannel = supabase.channel(friendRequestChannelName, {
      config: { private: true },
    });
    friendRequestChannel
      .on("broadcast", { event: "*" }, (payload) => {
        console.log(
          `Realtime friend request event for user ${userId}:`,
          payload
        );
        const newRequest = payload.payload.record;
        const fetchSenderProfile = async () => {
          // TODO: Add error handling involving retry and placeholder friend request with unknown if retry fails
          const { data: senderProfile, error } = await supabase
            .from("profiles")
            .select("name, image_url")
            .eq("id", newRequest.sender_id)
            .single();
          const enrichedRequest = {
            ...newRequest,
            profiles: senderProfile,
          };
          console.log("Enriched friend request:", enrichedRequest);
          setPendingRequests((prev) => [enrichedRequest, ...prev]);
        };
        fetchSenderProfile();
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Successfully subscribed to friend request channel: ${friendRequestChannelName}`
          );
        }
        if (status === "CHANNEL_ERROR") {
          console.error(
            `[${new Date().toISOString()}] Failed to subscribe to channel ${friendRequestChannelName}. Error:`,
            err
          );
        }
      });

    // User Friends Channel
    const userFriendsChannelName = `user_friends:${userId}`;
    const userFriendsChannel = supabase.channel(userFriendsChannelName, {
      config: { private: true },
    });
    userFriendsChannel
      .on("broadcast", { event: "INSERT" }, async (payload) => {
        console.log(
          `[${new Date().toISOString()}] Realtime user friends event for user ${userId}:`,
          payload
        );

        try {
          const friendsResult = await getFriendsWithStatus();
          if (friendsResult.success) {
            console.log(
              "Updated friends list from realtime event:",
              friendsResult.data
            );
            setFriends(friendsResult.data);
          } else {
            console.error("Failed to refetch friends:", friendsResult.error);
          }
        } catch (error) {
          console.error("Error refetching friends:", error);
        }
      })
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Successfully subscribed to user friends channel: ${userFriendsChannelName}`
          );
        }
        if (status === "CHANNEL_ERROR") {
          console.error(
            `[${new Date().toISOString()}] Failed to subscribe to channel ${userFriendsChannelName}. Error:`,
            err
          );
        }
      });

    return { friendRequestChannel, userFriendsChannel };
  };

  useEffect(() => {
    let channels: any = null;

    const initializeSubscription = async () => {
      if (channels) {
        console.log("Cleaning up existing subscriptions before resubscribing");
        if (channels.friendRequestChannel) {
          supabase.removeChannel(channels.friendRequestChannel);
        }
        if (channels.userFriendsChannel) {
          supabase.removeChannel(channels.userFriendsChannel);
        }
      }
      channels = await setupRealtimeSubscription();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log(
          `[${new Date().toISOString()}] Tab or window has become visible (refocused)!`
        );

        // Check if subscriptions are still active
        if (
          channels &&
          channels.friendRequestChannel?.state === "joined" &&
          channels.userFriendsChannel?.state === "joined"
        ) {
          console.log(
            "Realtime subscriptions are still active, no need to resubscribe"
          );
          return;
        }

        console.log("Resubscribing to realtime...");
        initializeSubscription();
      } else {
        console.log(
          `[${new Date().toISOString()}] Tab or window has become hidden!`
        );
      }
    };

    // Initial subscription
    initializeSubscription();

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (channels) {
        console.log("Cleaning up realtime subscriptions");
        if (channels.friendRequestChannel) {
          supabase.removeChannel(channels.friendRequestChannel);
        }
        if (channels.userFriendsChannel) {
          supabase.removeChannel(channels.userFriendsChannel);
        }
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [initialPendingRequests]);

  const parks = [
    { id: "park1", name: "Central Park Basketball Court" },
    { id: "park2", name: "Riverside Soccer Field" },
  ];

  // const pendingRequests = friendRequests.filter(
  //   (req) => req.status === "pending"
  // );
  const onlineFriends = friends.filter((friend) => friend.is_checked_in);
  const offlineFriends = friends.filter((friend) => !friend.is_checked_in);

  const getParkName = (parkId: string) => {
    const park = parks.find((p) => p.id === parkId);
    return park?.name || "Unknown Park";
  };

  const acceptFriendRequest = (id: number) => {
    console.log("Accept friend request:", id);
    // TODO: Implement actual friend request acceptance
  };

  const declineFriendRequest = (id: number) => {
    console.log("Decline friend request:", id);
    // TODO: Implement actual friend request decline
  };

  const removeFriend = (id: number) => {
    console.log("Remove friend:", id);
    // TODO: Implement actual friend removal
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full bg-background border-l border-border transition-all duration-300 z-50",
        isExpanded ? "w-80" : "w-0 opacity-0 pointer-events-none"
      )}
    >
      {/* Expanded State */}
      {isExpanded && (
        <div className="flex flex-col h-full pt-16">
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-4 p-2"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="px-4 pb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friends
              {pendingRequests.length > 0 && (
                <Badge variant="secondary">{pendingRequests.length}</Badge>
              )}
            </h2>
          </div>

          <ScrollArea className="flex-1 px-4">
            {/* Friend Requests */}
            {(pendingRequests.length > 0 || hasError) && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Friend Requests {!hasError && `(${pendingRequests.length})`}
                  </span>
                </div>

                {hasError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      Unable to retrieve pending friend requests. Please try
                      again.
                    </p>
                  </div>
                )}

                {!hasError && (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.sender_id}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              request.profiles.image_url || "/placeholder.svg"
                            }
                          />
                          <AvatarFallback>
                            {request.profiles.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {request.profiles.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(request.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => acceptFriendRequest(request.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => declineFriendRequest(request.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Separator className="my-4" />
              </div>
            )}

            {/* Online Friends */}
            {onlineFriends.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Online ({onlineFriends.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {onlineFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={friend.friend_image_url || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {friend.friend_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {friend.friend_name}
                        </p>
                        {friend.checked_in_park_name ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">
                              {friend.checked_in_park_name}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Online
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFriend(friend.friend_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Friends */}
            {offlineFriends.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 bg-gray-400 rounded-full" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Offline ({offlineFriends.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {offlineFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 opacity-60">
                          <AvatarImage
                            src={friend.friend_image_url || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {friend.friend_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-gray-400 border-2 border-background rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate opacity-60">
                          {friend.friend_name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Offline</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFriend(friend.friend_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {friends.length === 0 && pendingRequests.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  No friends yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Start connecting with other players!
                </p>
              </div>
            )}

            <div className="mt-8 pb-4">
              <Separator className="mb-4" />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-red-50"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
