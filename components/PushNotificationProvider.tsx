"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PushNotificationModal } from "./PushNotificationModal";

interface PushNotificationProviderProps {
  children: React.ReactNode;
}

export function PushNotificationProvider({
  children,
}: PushNotificationProviderProps) {
  const [showModal, setShowModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);

    const checkShouldShowModal = async () => {
      const hasBeenPrompted = sessionStorage.getItem(
        "push_notifications_prompted"
      );

      if (hasBeenPrompted !== "true") {
        if ("serviceWorker" in navigator && "PushManager" in window) {
          try {
            const registration =
              await navigator.serviceWorker.getRegistration();
            const subscription = registration
              ? await registration.pushManager.getSubscription()
              : null;

            if (!subscription) {
              setShowModal(true);
            } else {
              sessionStorage.setItem("push_notifications_prompted", "true");
            }
          } catch (error) {
            console.log("Could not check existing subscription:", error);
            setShowModal(true);
          }
        } else {
          sessionStorage.setItem("push_notifications_prompted", "true");
        }
      }
    };

    checkShouldShowModal();
  }, []);

  // Don't render modal during SSR
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {pathname !== "/login" && (
        <PushNotificationModal isOpen={showModal} onOpenChange={setShowModal} />
      )}
    </>
  );
}
