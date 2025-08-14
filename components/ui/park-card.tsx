"use client";
import React, { FC, useTransition } from "react";
import { addParkForUser } from "@/app/parks/actions";
import { Database } from "@/lib/database.types";
type Park = Database["public"]["Tables"]["park"]["Row"];
interface ParkCardProps {
  park: Park;
}
const ParkCard: FC<ParkCardProps> = ({ park }) => {
  const [isPending, startTransition] = useTransition();

  const handleAddParkForUser = async () => {
    startTransition(async () => {
      const response = await addParkForUser(park.id);
      if (response.success) {
        alert(response.message || "Park added successfully!");
      } else {
        alert(
          response.message || "Failed to add park. Please try again later."
        );
      }
    });
  };
  return (
    <div className="border rounded-lg p-4 shadow-md flex flex-col gap-2 bg-white">
      <h2 className="text-lg font-bold">{park.name}</h2>
      <p className="text-gray-600">Location: {park.location}</p>
      <button
        className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
        onClick={handleAddParkForUser}
      >
        {isPending ? "Adding..." : "Add Park"}
      </button>
    </div>
  );
};

export default ParkCard;
