"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitReport(parkId: number, count: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }
    const { error } = await supabase.from("reports").insert({
      park_id: parkId,
      report_count: count,
      user_id: user.id,
    });
    if (error) {
      return { success: false, message: "Failed to submit report." };
    }
    revalidatePath("/");
    return { success: true, message: "Report submitted successfully!" };
  } catch (err) {
    return { success: false, message: "Could not connect to the server." };
  }
}
