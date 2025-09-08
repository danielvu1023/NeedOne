"use server";

import webpush from "web-push";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { encrypt, decrypt } from "@/lib/encryption";

webpush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

import type { PushSubscription } from "web-push";
import { redirect } from "next/navigation";

export async function subscribeUser(sub: PushSubscription) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent");
    const userAgentInfo = userAgent ? { userAgent } : null;

    const encryptedAuthKey = encrypt(sub.keys.auth);

    const { data: pushSubscription, error } = await supabase
      .from("push_subscriptions")
      .insert({
        user_id: user.id,
        endpoint: sub.endpoint,
        p256dh_key: sub.keys.p256dh,
        auth_key: encryptedAuthKey,
        user_agent_info: userAgentInfo,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: "Failed to save subscription" };
    }

    return { success: true, id: pushSubscription.id };
  } catch (error) {
    console.error("Error subscribing user:", error);
    return { success: false, error: "Failed to save subscription" };
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .update({
        status: "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("endpoint", endpoint)
      .eq("status", "active");

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: "Failed to unsubscribe" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing user:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

export async function sendNotification(message: string, userId: string) {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error || !subscription) {
      console.error("No active subscription found for user:", userId);
      return { success: false, error: "No active subscription found" };
    }

    const decryptedAuthKey = decrypt(subscription.auth_key);

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: decryptedAuthKey,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        title: "Test Notification",
        body: message,
        icon: "/my-favicon/web-app-manifest-192x192.png",
        url: process.env.NGROK_URL!,
      })
    );

    await supabase
      .from("push_subscriptions")
      .update({ last_successful_push: new Date().toISOString() })
      .eq("id", subscription.id);

    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
