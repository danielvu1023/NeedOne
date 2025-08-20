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
  debugger;
  const { data: friends, error: friendsError } = await supabase
    .from("friendships")
    .select("profile:user_id_2(id, name)")
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
  debugger;
  // TODO: Add checks to see if they are already friends or if a request already exists.

  const { error } = await supabase
    .from("friend_requests")
    .insert({ sender_id: user.id, receiver_id: receiverId });

  if (error) {
    return {
      success: false,
      message:
        "Could not send friend request. They may have already sent you one.",
    };
  }

  revalidatePath("/friends"); // Revalidate pages that show friend requests
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
  debugger;
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
