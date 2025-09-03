"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AddParkCardSkeleton() {
  return (
    <Card className="park-card">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardHeader>

      <CardContent>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}