"use server";
import { ApiResponse } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addPark(parkId: number): Promise<ApiResponse> {
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
