"use client";
import React, { FC, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Grid3X3,
  Zap,
  Sun,
  Home,
  Users,
  Lock,
} from "lucide-react";
import { addParkForUser } from "@/app/parks/actions";
interface AddParkCardProps {
  park: {
    id: string;
    name: string;
    location: string;
    courts: number;
    tags: {
      net: "permanent" | "bring-own";
      environment: "outdoor" | "indoor";
      access: "public" | "private";
    };
  };
}

const AddParkCard: FC<AddParkCardProps> = ({ park }) => {
  const [isPending, startTransition] = useTransition();

  // Mock data if no park prop provided

  return (
    <Card className="park-card transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-poppins font-semibold">
          {park.name}
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground font-inter">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {park.location}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge
            variant="secondary"
            className="text-xs flex items-center gap-1 font-inter"
          >
            <Grid3X3 className="h-3 w-3" />
            <span className="font-jetbrains-mono">{park.courts}</span> courts
          </Badge>
          <Badge
            variant="outline"
            className="text-xs flex items-center gap-1 font-inter"
          >
            <Zap className="h-3 w-3" />
            {park.tags.net === "permanent" ? "Permanent net" : "Bring own net"}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs flex items-center gap-1 font-inter"
          >
            {park.tags.environment === "outdoor" ? (
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
          <Badge
            variant="outline"
            className="text-xs flex items-center gap-1 font-inter"
          >
            {park?.tags?.access === "public" ? (
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
        <Button
          onClick={() =>
            startTransition(async () => {
              await addParkForUser(park?.id);
            })
          }
          disabled={isPending}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isPending ? "Adding..." : "Add to my parks"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddParkCard;
