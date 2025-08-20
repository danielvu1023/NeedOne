// app/friends/page.js

import { getFriendsList, getFriendRequests } from "./actions";

export default async function FriendsPage() {
  const { friends, error } = await getFriendsList();
  const { data: requests, message, success } = await getFriendRequests();

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>My Friends</h1>
      <p>
        {friends?.map((friend) => (
          <span key={friend.profile.id}>
            {friend.profile.name} ({friend.profile.id})
          </span>
        ))}
      </p>
      <h2 className="mt-6">Pending Friend Requests</h2>
      {!success && <p>{message}</p>}
      <ul>
        {requests?.length === 0 && <li>No pending requests.</li>}
        {requests?.map((req) => (
          <li key={req.id}>
            From: {req.sender?.name || req.sender_id} ({req.sender_id})
          </li>
        ))}
      </ul>
    </div>
  );
}
