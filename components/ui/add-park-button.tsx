"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/buttons";
import { Plus, CheckCircle } from "lucide-react";
import { addParkForUser } from "@/app/parks/actions";

interface AddParkButtonProps {
  parkId: number;
  parkName: string;
}

export function AddParkButton({ parkId, parkName }: AddParkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddPark = () => {
    startTransition(async () => {
      try {
        const result = await addParkForUser(parkId);
        if (result.success) {
          setIsAdded(true);
          // Reset after 2 seconds
          setTimeout(() => setIsAdded(false), 2000);
        } else {
          alert(result.message || "Failed to add park");
        }
      } catch (error) {
        alert("An error occurred while adding the park");
      }
    });
  };

  if (isAdded) {
    return (
      <Button disabled className="w-full bg-green-600 hover:bg-green-700 font-inter">
        <CheckCircle className="h-4 w-4 mr-2" />
        Added to your parks!
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleAddPark} 
      disabled={isPending} 
      className="w-full font-inter"
    >
      <Plus className="h-4 w-4 mr-2" />
      {isPending ? "Adding..." : "Add to my parks"}
    </Button>
  );
}