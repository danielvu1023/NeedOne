"use server";
import { ApiDataResponse, ApiResponse } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function getFriendsList() {
  // 1. Get the current authenticated user's session
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }
  const { data: friends, error: friendsError } = await supabase
    .from("friendships")
    .select("profiles:user_id_2(id, name)")
    .eq("user_id_1", user.id);

  // 2. We need two queries because the user can be in either column.
  //   //    Promise.all runs both queries concurrently for better performance.
  //   const [friendsOne, friendsTwo] = await Promise.all([
  //     // Query 1: Find friends where the current user is user_id_1
  //     // and fetch the profile of the user in user_id_2
  //     supabase
  //       .from("friendships")
  //       .select("profiles:user_id_2(id, username)") // This joins with the profiles table
  //       .eq("user_id_1", user.id),

  //     // Query 2: Find friends where the current user is user_id_2
  //     // and fetch the profile of the user in user_id_1
  //     supabase
  //       .from("friendships")
  //       .select("profiles:user_id_1(id, username)")
  //       .eq("user_id_2", user.id),
  //   ]);

  //   // Check for errors in either query
  //   if (friendsOne.error || friendsTwo.error) {
  //     console.error(
  //       "Error fetching friends:",
  //       friendsOne.error || friendsTwo.error
  //     );
  //     return { friends: null, error: "Could not retrieve friends list." };
  //   }

  //   // 3. The results are nested, so we need to combine and clean them up.
  //   //    - friendsOne.data might look like: [{ profiles: {id, username} }, ...]
  //   //    - friendsTwo.data might look like: [{ profiles: {id, username} }, ...]

  //   const combinedFriends = [
  //     ...friendsOne.data.map((item) => item.profiles),
  //     ...friendsTwo.data.map((item) => item.profiles),
  //   ];

  return { friends, error: null };
}
// TODO: Need to test
export async function sendFriendRequest(
  receiverId: string
): Promise<ApiResponse> {
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

  // 4. If a latest request exists, check its status.
  if (latestRequest) {
    // If the latest interaction is still pending, don't allow a new one.
    if (latestRequest.status === "pending") {
      return {
        success: false,
        message:
          "A friend request is already pending between you and this user.",
      };
    }
    // If the latest was accepted, they are friends. Redundant due to the friendship check, but good for consistency.
    if (latestRequest.status === "accepted") {
      return { success: false, message: "You are already friends." };
    }
    // If the latest was 'declined', the logic proceeds to the INSERT step, which is exactly what we want.
  }

  // 5. If no request exists, OR the latest one was declined, we are clear to insert a new request.
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

  revalidatePath("/friends");
  return { success: true, message: "Friend request sent!" };
}
export async function getFriendRequests() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }
  // Query friend_requests where current user is receiver and status is 'pending'
  const { data: requests, error } = await supabase
    .from("friend_requests")
    .select("id, sender_id, receiver_id, status, sender:sender_id(id, name)")
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) {
    return {
      data: null,
      message: "Could not retrieve friend requests.",
      success: false,
    };
  }
  return { data: requests, message: null, success: true };
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
