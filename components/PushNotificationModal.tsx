"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/buttons";
import { Bell, BellOff } from "lucide-react";
import { subscribeUser } from "@/app/notifications/actions";

interface PushNotificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationModal({
  isOpen,
  onOpenChange,
}: PushNotificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    return registration;
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });

    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
    return sub;
  }

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!("serviceWorker" in navigator && "PushManager" in window)) {
        throw new Error("Push notifications are not supported in this browser");
      }

      await registerServiceWorker();
      await subscribeToPush();

      sessionStorage.setItem("push_notifications_prompted", "true");

      onOpenChange(false);
    } catch (err) {
      console.error("Push notification setup failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to enable notifications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    sessionStorage.setItem("push_notifications_prompted", "true");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle>Enable Push Notifications?</DialogTitle>
          <DialogDescription className="text-left mt-4">
            Stay updated with real-time notifications about:
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              <li>Friend activity at parks</li>

              <li>New friend requests</li>
              <li>Park updates and announcements</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              You can change this setting anytime in your browser.
            </p>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <BellOff className="mr-2 h-4 w-4" />
            Not Now
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Bell className="mr-2 h-4 w-4" />
            {isLoading ? "Enabling..." : "Enable Notifications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
