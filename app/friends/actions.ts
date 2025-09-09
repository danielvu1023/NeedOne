"use server";
import { ApiDataResponse, ApiResponse } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function sendFriendRequest(
  receiverId: string
): Promise<ApiResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    // 1. Prevent self-requests
    if (user.id === receiverId) {
      return {
        success: false,
        message: "You cannot send a friend request to yourself.",
      };
    }

    // 2. Check if already friends (this check remains crucial)
    const [user_id_1, user_id_2] = [user.id, receiverId].sort();
    const { data: friendship } = await supabase
      .from("friendships")
      .select("user_id_1")
      .match({ user_id_1, user_id_2 })
      .maybeSingle();

    if (friendship) {
      return {
        success: false,
        message: "You are already friends with this user.",
      };
    }

    // 3. Find the MOST RECENT request between these two users to check its status.
    const { data: latestRequest, error: requestError } = await supabase
      .from("friend_requests")
      .select("status")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: false }) // Order by most recent
      .limit(1) // Get only the latest one
      .maybeSingle();

    if (requestError) {
      console.error("Error checking latest request:", requestError);
      return { success: false, message: "A database error occurred." };
    }

    if (latestRequest?.status === "pending") {
      return {
        success: false,
        message:
          "A friend request is already pending between you and this user.",
      };
    }

    const { error: insertError } = await supabase
      .from("friend_requests")
      .insert({ sender_id: user.id, receiver_id: receiverId });

    if (insertError) {
      console.error("Error inserting new friend request:", insertError);
      return {
        success: false,
        message: "Could not send friend request. Please try again.",
      };
    }

    revalidatePath("/");
    return { success: true, message: "Friend request sent!" };
  } catch (error) {
    console.error("Unexpected error in sendFriendRequest:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
export async function getFriendsWithStatus(): Promise<ApiDataResponse<any[]>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    const { data: friends, error } = await supabase.rpc(
      "get_friends_with_status",
      {
        p_user_id: user.id,
      }
    );

    if (error) {
      console.error("Error fetching friends with status:", error);
      return {
        data: null,
        message: "Could not retrieve friends with status.",
        success: false,
        error: error.message,
      };
    }

    return {
      data: friends || [],
      message: null,
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error in getFriendsWithStatus:", error);
    return {
      data: null,
      message: "An unexpected error occurred.",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPendingFriendRequests() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    const { data: requests, error } = await supabase
      .from("friend_requests")
      .select(
        `
        id,
        sender_id,
        created_at,
        status,
        profiles!sender_id (
          id,
          name,
          image_url
        )
      `
      )
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        data: null,
        message: "Could not retrieve friend requests.",
        success: false,
      };
    }

    return {
      data: requests || [],
      message: null,
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error in getPendingFriendRequests:", error);
    return {
      data: null,
      message: "An unexpected error occurred.",
      success: false,
    };
  }
}

export async function acceptFriendRequest(senderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }
  // Enforce consistent ordering for the friendships table
  const [user_id_1, user_id_2] = [user.id, senderId].sort();

  // Use an RPC function (database transaction) to ensure atomicity
  const { error } = await supabase.rpc("accept_friend_request", {
    request_sender_id: senderId,
    request_receiver_id: user.id,
    friend_user_1: user_id_1,
    friend_user_2: user_id_2,
  });

  if (error) {
    return { success: false, message: "Failed to accept friend request." };
  }

  revalidatePath("/friends");
  return { success: true, message: "Friend request accepted." };
}

export async function declineFriendRequest(senderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("friend_requests")
    .delete()
    .or(
      `(sender_id.eq.${senderId},receiver_id.eq.${user.id}),(sender_id.eq.${user.id},receiver_id.eq.${senderId})`
    );

  if (error) {
    return { success: false, message: "Could not decline friend request." };
  }

  revalidatePath("/friends");
  return { success: true, message: "Friend request declined." };
}

// export async function removeFriend(friendId) {
//   const user = await getAuthenticatedUser();
//   const supabase = createClient();

//   const [user_id_1, user_id_2] = [user.id, friendId].sort();

//   const { error } = await supabase
//     .from('friendships')
//     .delete()
//     .match({ user_id_1, user_id_2 });

//   if (error) {
//     return { error: 'Could not remove friend.' };
//   }

//   // Also remove any historical friend requests between them
//   await supabase
//     .from('friend_requests')
//     .delete()
//     .or(`(sender_id.eq.${user.id},receiver_id.eq.${friendId}),(sender_id.eq.${friendId},receiver_id.eq.${user.id})`);

//   revalidatePath('/friends');
//   return { success: 'Friend removed.' };
// }
