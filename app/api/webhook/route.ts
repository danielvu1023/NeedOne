import { NextRequest, NextResponse } from "next/server";
import { WebhookPayload } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  console.log("Webhook endpoint hit - POST request received");
  try {
    const body: WebhookPayload = await request.json();
    console.log("Webhook payload:", JSON.stringify(body, null, 2));

    const headers = Object.fromEntries(request.headers.entries());
    console.log("Webhook headers:", JSON.stringify(headers, null, 2));

    // Process check-in events to get friends' push subscriptions
    if (body.table === "check_ins" && body.type === "INSERT" && body.record) {
      const userId = body.record.user_id;
      console.log(`Processing check-in for user: ${userId}`);

      // Create Supabase client
      const supabase = createClient();

      // Call RPC function to get friends' active push subscriptions
      const { data: pushSubscriptions, error } = await supabase.rpc(
        "get_friends_push_subscriptions",
        { target_user_id: userId }
      );

      if (error) {
        console.error("Error fetching friends push subscriptions:", error);
      } else {
        console.log(
          `Found ${
            pushSubscriptions?.length || 0
          } active push subscriptions for friends:`,
          pushSubscriptions
        );

        // TODO: Send push notifications to these subscriptions
        // This is where you would integrate with your push notification service
        for (const subscription of pushSubscriptions || []) {
          console.log(`Would send push to user ${subscription.user_id}:`, {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh_key,
              auth: subscription.auth_key,
            },
          });
        }
      }
    }

    console.log("Webhook processing completed successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Webhook received successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log("Webhook endpoint hit - GET request received");
  console.log("GET request URL:", request.url);

  return NextResponse.json(
    {
      message: "Webhook endpoint is active",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
