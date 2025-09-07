import { ReactNode } from "react";
import Navbar from "@/components/ui/navbar";
import { FriendsSidePanel } from "@/components/ui/friends-side-panel";
import { FriendsPanelProvider } from "@/contexts/friends-panel-context";
import { createClient } from "@/utils/supabase/server";
import {
  getPendingFriendRequests,
  getFriendsWithStatus,
} from "@/app/friends/actions";

interface AppLayoutProps {
  children: ReactNode;
}

export async function AppLayout({ children }: AppLayoutProps) {
  const friendRequestsResult = await getPendingFriendRequests();
  const friendsWithStatusResult = await getFriendsWithStatus();
  if (!friendRequestsResult.success) {
    console.error(
      "Failed to fetch pending friend requests:",
      friendRequestsResult.error
    );
  }

  if (!friendsWithStatusResult.success) {
    console.error(
      "Failed to fetch friends with status:",
      friendsWithStatusResult.error
    );
  }

  const pendingFriendRequests = friendRequestsResult.success
    ? friendRequestsResult.data
    : [];
  const friendsWithStatus = friendsWithStatusResult.success
    ? friendsWithStatusResult.data
    : [];
  const hasError = !friendRequestsResult.success;
  return (
    <FriendsPanelProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">{children}</main>
        <FriendsSidePanel
          initialPendingRequests={pendingFriendRequests}
          friendsWithStatus={friendsWithStatus}
          hasError={hasError}
        />
      </div>
    </FriendsPanelProvider>
  );
}
