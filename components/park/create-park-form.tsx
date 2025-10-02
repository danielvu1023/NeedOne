"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Grid3X3,
  Zap,
  Sun,
  Home,
  Users,
  Lock,
} from "lucide-react";

export function CreateParkForm() {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    courts: "",
    maxPlayers: "",
    net: "permanent",
    environment: "outdoor",
    access: "public",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Park Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Park Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g. Central Basketball Court"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g. Downtown Park, Main Street"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the park and facilities"
              rows={3}
            />
          </div>

          {/* Park Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courts">Number of Courts</Label>
              <Input
                id="courts"
                type="number"
                value={formData.courts}
                onChange={(e) => handleInputChange("courts", e.target.value)}
                placeholder="4"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPlayers">Max Players</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={formData.maxPlayers}
                onChange={(e) => handleInputChange("maxPlayers", e.target.value)}
                placeholder="10"
                min="1"
              />
            </div>
          </div>

          {/* Tags Selection */}
          <div className="space-y-3">
            <Label>Park Tags</Label>

            <div className="space-y-2">
              <Label className="text-sm">Net Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.net === "permanent" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleInputChange("net", "permanent")}
                >
                  <Zap className="h-3 w-3" />
                  Permanent
                </Button>
                <Button
                  type="button"
                  variant={formData.net === "bring-own" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleInputChange("net", "bring-own")}
                >
                  <Zap className="h-3 w-3" />
                  Bring Own
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Environment</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.environment === "outdoor" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleInputChange("environment", "outdoor")}
                >
                  <Sun className="h-3 w-3" />
                  Outdoor
                </Button>
                <Button
                  type="button"
                  variant={formData.environment === "indoor" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleInputChange("environment", "indoor")}
                >
                  <Home className="h-3 w-3" />
                  Indoor
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Access</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.access === "public" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleInputChange("access", "public")}
                >
                  <Users className="h-3 w-3" />
                  Public
                </Button>
                <Button
                  type="button"
                  variant={formData.access === "private" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleInputChange("access", "private")}
                >
                  <Lock className="h-3 w-3" />
                  Private
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview Tags</Label>
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                <Grid3X3 className="h-3 w-3" />
                {formData.courts || "0"} courts
              </Badge>
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                {formData.net === "permanent" ? "Permanent net" : "Bring own net"}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs flex items-center gap-1"
              >
                {formData.environment === "outdoor" ? (
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
                className="text-xs flex items-center gap-1"
              >
                {formData.access === "public" ? (
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
          </div>

          <Button className="w-full" disabled>
            Create Park
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
