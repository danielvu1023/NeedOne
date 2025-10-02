import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateParkForm } from "@/components/park/create-park-form";

export default async function ModeratorCreateParkPage() {
  return (
    <AppLayout>
      <div className="min-w-80 max-w-[728px] mx-auto p-4 space-y-6">
        <div>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create New Park</h1>
          <p className="text-muted-foreground">Add a new park to the system</p>
        </div>

        <CreateParkForm />
      </div>
    </AppLayout>
  );
}
