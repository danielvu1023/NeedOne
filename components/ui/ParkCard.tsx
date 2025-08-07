"use client";
import React from "react";

interface ParkCardProps {
  name: string;
  location: string;
  onAdd: () => void;
}

const ParkCard: React.FC<ParkCardProps> = ({ name, location, onAdd }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md flex flex-col gap-2 bg-white">
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-gray-600">Location: {location}</p>
      <button
        className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
        onClick={onAdd}
      >
        Add to My Parks
      </button>
    </div>
  );
};

export default ParkCard;
