"use client";
import React, { useState } from "react";
import Navbar from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Grid3X3, Zap, Sun, Home, Users, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ModeratorCreateParkPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    courts: "",
    maxPlayers: "",
    net: "permanent",
    environment: "outdoor", 
    access: "public"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      alert(`Park "${formData.name}" created successfully!`);
      setIsSubmitting(false);
      // Reset form
      setFormData({
        name: "",
        location: "",
        description: "",
        courts: "",
        maxPlayers: "",
        net: "permanent",
        environment: "outdoor",
        access: "public"
      });
    }, 1500);
  };

  return (
    <div className="min-w-80 max-w-[728px] mx-auto">
      <Navbar />
      <div className="pt-20 p-4 space-y-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mb-2">Create New Park</h1>
          <p className="text-muted-foreground">Add a new park to the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Park Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="name">Park Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Central Basketball Court"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g. Downtown Park, Main Street"
                  required
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
                    required
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
                    required
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
                      onClick={() => handleInputChange("net", "permanent")}
                      className="flex items-center gap-1"
                    >
                      <Zap className="h-3 w-3" />
                      Permanent
                    </Button>
                    <Button
                      type="button"
                      variant={formData.net === "bring-own" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("net", "bring-own")}
                      className="flex items-center gap-1"
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
                      onClick={() => handleInputChange("environment", "outdoor")}
                      className="flex items-center gap-1"
                    >
                      <Sun className="h-3 w-3" />
                      Outdoor
                    </Button>
                    <Button
                      type="button"
                      variant={formData.environment === "indoor" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("environment", "indoor")}
                      className="flex items-center gap-1"
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
                      onClick={() => handleInputChange("access", "public")}
                      className="flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      Public
                    </Button>
                    <Button
                      type="button"
                      variant={formData.access === "private" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("access", "private")}
                      className="flex items-center gap-1"
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
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Grid3X3 className="h-3 w-3" />
                    {formData.courts || "0"} courts
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {formData.net === "permanent" ? "Permanent net" : "Bring own net"}
                  </Badge>
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
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
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
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

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Park..." : "Create Park"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}