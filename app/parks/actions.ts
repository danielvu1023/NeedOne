"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addPark(parkId: string) {
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
    console.error("Error adding park user:", parkUserError);
  }

  // Revalidate the path to refresh the data on the page
  revalidatePath("/parks");
}
