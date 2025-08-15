"use server";
import { ApiDataResponse, ApiResponse } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function addParkForUser(parkId: number): Promise<ApiResponse> {
  try {
    const supabase = await createClient();
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data?.user) {
      redirect("/login");
    }

    const userId = data.user.id;
    const { error: parkUserError } = await supabase
      .from("park_users")
      .insert({ user_id: userId, park_id: parkId });

    if (parkUserError) {
      if (parkUserError.code === "23505") {
        return {
          success: false,
          message: "This park is already in your list.",
        };
      }
      return {
        success: false,
        message: "Failed to add park. Please try again later.",
      };
    }

    // Revalidate the path to refresh the data on the page
    revalidatePath("/parks");
    return { success: true, message: "Park added successfully!" };
  } catch (err) {
    return {
      success: false,
      message: "Could not connect to the server. Please try again later.",
    };
  }
}

export async function deleteParkForUser(parkId: number) {
  try {
    const supabase = await createClient();
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data?.user) {
      redirect("/login");
    }

    const userId = data.user.id;

    const { error: deleteError } = await supabase
      .from("park_users")
      .delete()
      .match({ user_id: userId, park_id: parkId });

    if (deleteError) {
      return {
        success: false,
        message: "Failed to remove park. Please try again later.",
      };
    }
    revalidatePath("/");
    return { success: true, message: "Park removed successfully!" };
  } catch (err) {
    return {
      success: false,
      message: "Could not connect to the server. Please try again later.",
    };
  }
}

export async function checkoutUser(parkId: number): Promise<ApiResponse> {
  try {
    const supabase = await createClient();
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data?.user) {
      redirect("/login");
    }

    const userId = data.user.id;
    const { error: checkoutError } = await supabase
      .from("check_in")
      // 1. Specify the data to update.
      .update({
        check_out_time: new Date().toISOString(),
      })
      // 2. Add the first part of the WHERE clause for user and park.
      .match({
        user_id: userId,
        park_id: parkId,
      })
      // 3. Add the crucial condition to only target active check-ins.
      .is("check_out_time", null);

    if (checkoutError) {
      return {
        success: false,
        message: "Failed to checkout from park. Please try again later.",
      };
    }
    revalidatePath("/");
    return { success: true, message: "Successfully checked out from park!" };
  } catch (err) {
    return {
      success: false,
      message: "Could not connect to the server. Please try again later.",
    };
  }
}

export async function checkInUser(parkId: number): Promise<ApiResponse> {
  try {
    // Step 1: Authenticate the user (Identical to checkout)
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    // Step 2: Call the PostgreSQL function via RPC
    // This is the core logic. We pass the parkId to our custom function.
    const { error: rpcError } = await supabase.rpc("check_in_user", {
      park_id_to_check_in: parkId,
    });

    if (rpcError) {
      if (rpcError.code === "P0001") {
        return {
          success: false,
          message: "You are already checked in at this park.",
        };
      }

      console.error("Check-in RPC error:", rpcError.message);
      return {
        success: false,
        message: "Failed to check in. Please try again later.",
      };
    }

    revalidatePath("/");
    return { success: true, message: "Checked in successfully!" };
  } catch (err) {
    return {
      success: false,
      message: "Could not connect to the server. Please try again later.",
    };
  }
}

export async function getUserCheckInStatus(
  parkId: number
): Promise<ApiDataResponse<boolean>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    // We don't need the data, just the count. This is a very efficient query.
    const { count, error } = await supabase
      .from("check_in")
      .select("*", { count: "exact", head: true }) // head: true is key!
      .match({ user_id: user.id, park_id: parkId })
      .is("check_out_time", null);

    if (error) {
      console.error("Error fetching check-in status:", error);
      return { success: false }; // Fail safely
    }

    // If the count of active check-ins is greater than 0, they are checked in.
    return { success: true, data: count !== null && count > 0 };
  } catch (err) {
    console.error("Exception fetching check-in status:", err);
    return { success: false }; // Fail safely
  }
}

export async function getParkReportCount(
  parkId: number
): Promise<ApiDataResponse<number>> {
  try {
    const supabase = await createClient();
    const { data: latestReport, error } = await supabase
      .from("reports") // 1. From the 'reports' table
      .select("*") // 2. Select all columns
      .eq("park_id", parkId) // 3. Filter for the specific park
      .order("created_at", { ascending: false }) // 4. Order by date, newest first
      .limit(1); // 5. Get only the top result

    if (error) {
      console.error("Error fetching park report:", error);
      return { success: false, message: "Failed to fetch park report." };
    }
    const count = latestReport[0].report_count;
    return { success: true, data: count };
  } catch (err) {
    console.error("Exception fetching park report:", err);
    return { success: false, message: "Could not connect to the server." };
  }
}

export async function getAllParks() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("park").select("*");

    if (error) {
      console.error("Error fetching parks:", error);
      return { success: false, message: "Failed to fetch parks." };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Exception fetching parks:", err);
    return { success: false, message: "Could not connect to the server." };
  }
}
