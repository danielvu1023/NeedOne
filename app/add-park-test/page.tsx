// app/add-park-test/page.tsx
"use client";
import Navbar from "@/components/ui/navbar";
import AddParkCard from "@/components/ui/add-park-card";
import { AddParkCardSkeleton } from "@/components/ui/add-park-card-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const mockParks = [
  {
    id: 1,
    name: "Central Basketball Court",
    location: "Downtown Park, Main Street",
    courts: 4,
    tags: {
      net: 'permanent',
      environment: 'outdoor',
      access: 'public'
    }
  },
  {
    id: 2,
    name: "Westside Tennis Courts", 
    location: "Westside Recreation Center",
    courts: 6,
    tags: {
      net: 'bring-own',
      environment: 'indoor',
      access: 'private'
    }
  },
  {
    id: 3,
    name: "Riverside Soccer Field",
    location: "Riverside Park, Oak Avenue",
    courts: 2,
    tags: {
      net: 'permanent',
      environment: 'outdoor',
      access: 'public'
    }
  },
  {
    id: 4,
    name: "Community Volleyball Court",
    location: "Community Center, Pine Street",
    courts: 3,
    tags: {
      net: 'bring-own',
      environment: 'outdoor',
      access: 'public'
    }
  },
  {
    id: 5,
    name: "North Side Swimming Pool",
    location: "North Community Center",
    courts: 1,
    tags: {
      net: 'permanent',
      environment: 'indoor',
      access: 'private'
    }
  }
];

export default function AddParkTestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [parks, setParks] = useState([]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setParks(mockParks);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

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
            Back to My Parks
          </Button>
          <h1 className="text-2xl font-bold mb-2">Add Parks</h1>
          <p className="text-muted-foreground">Find and add parks to your list</p>
        </div>
        
        <div className="flex flex-col gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <AddParkCardSkeleton key={index} />
              ))
            : parks.map((park) => (
                <AddParkCard key={park.id} park={park} />
              ))}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Default Add Park Card</h2>
          <div className="max-w-md">
            <AddParkCard />
          </div>
        </div>
      </div>
    </div>
  );
}