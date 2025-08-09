"use server";
import { ApiResponse } from "@/lib/types";
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
      .eq("user_id", userId)
      .eq("park_id", parkId);

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
      .delete()
      .match({ user_id: userId, park_id: parkId });

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
