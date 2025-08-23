"use client";
import { useTransition, useState } from "react";
import { acceptFriendRequest } from "@/app/friends/actions";

interface AcceptFriendRequestButtonProps {
  senderId: string;
}

export default function AcceptFriendRequestButton({
  senderId,
}: AcceptFriendRequestButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAccept = async () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await acceptFriendRequest(senderId);
      if (result?.success) {
        setSuccess(result.message || "Friend request accepted.");
      } else {
        setError(result?.message || "Failed to accept friend request.");
      }
    });
  };

  return (
    <span>
      <button
        type="button"
        className="ml-2 px-2 py-1 bg-green-500 text-white rounded disabled:opacity-50"
        onClick={handleAccept}
        disabled={isPending}
      >
        {isPending ? "Accepting..." : "Accept"}
      </button>
      {error && <span className="ml-2 text-red-500 text-sm">{error}</span>}
      {success && (
        <span className="ml-2 text-green-600 text-sm">{success}</span>
      )}
    </span>
  );
}
