"use client";
import React, { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Grid3X3, Zap, Sun, Home, Users, Lock } from "lucide-react";

interface AddParkCardProps {
  park?: {
    id: number;
    name: string;
    location: string;
    courts: number;
    tags?: {
      net: "permanent" | "bring-own";
      environment: "outdoor" | "indoor";
      access: "public" | "private";
    };
  };
}

const AddParkCard: FC<AddParkCardProps> = ({ park }) => {
  const [isPending, setIsPending] = useState(false);

  // Mock data if no park prop provided
  const mockPark = park || {
    id: 1,
    name: "Central Basketball Court",
    location: "Downtown Park, Main Street",
    courts: 4,
    tags: {
      net: "permanent",
      environment: "outdoor",
      access: "public",
    },
  };

  const handleAddPark = () => {
    setIsPending(true);
    setTimeout(() => {
      alert(`"${mockPark.name}" added to your parks!`);
      setIsPending(false);
    }, 1000);
  };

  return (
    <Card className="park-card transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{mockPark.name}</CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {mockPark.location}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Grid3X3 className="h-3 w-3" />
            {mockPark.courts} courts
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {mockPark.tags?.net === "permanent"
              ? "Permanent net"
              : "Bring own net"}
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            {mockPark.tags?.environment === "outdoor" ? (
              <>
                <Sun className="h-3 w-3" />
                Outdoor
              </>
            ) : (
              <>
                <Home className="h-3 w-3" />
                Indoor
              </>
            )}
          </Badge>
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            {mockPark.tags?.access === "public" ? (
              <>
                <Users className="h-3 w-3" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Private
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Button onClick={handleAddPark} disabled={isPending} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {isPending ? "Adding..." : "Add to my parks"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddParkCard;
