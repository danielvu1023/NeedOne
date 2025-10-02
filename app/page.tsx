// app/test/page.js
import { AppLayout } from "@/components/layout/app-layout";
import ParkCard from "@/components/ui/park-card";
import { ParkCardSkeleton } from "@/components/ui/park-card-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { MyParksList } from "@/components/park/my-parks-list";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/dist/client/components/navigation";

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  const userId = data.user.id;

  const userParks = supabase.rpc("get_parks_with_check_ins", {
    p_user_id: userId,
  });
  return (
    <AppLayout>
      <div className="min-w-80 max-w-[728px] mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">My Parks</h1>
              <form action="">
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh parks</span>
                </Button>
              </form>
            </div>
            <p className="text-muted-foreground">
              Your added parks and their current activity
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/parks"
              className={buttonVariants({
                className: "flex items-center gap-2",
              })}
            >
              <Plus className="h-4 w-4" />
              Add Parks
            </Link>
            <Link
              href="/moderator-create-park"
              className={buttonVariants({
                variant: "outline",
                className: "flex items-center gap-2",
              })}
            >
              <Plus className="h-4 w-4" />
              Create Park
            </Link>
          </div>
        </div>
        <Suspense fallback={<ParkCardSkeleton />}>
          <MyParksList parks={userParks} />
        </Suspense>
      </div>
    </AppLayout>
  );
}
