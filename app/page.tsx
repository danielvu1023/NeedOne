import ParkPlayerCount from "@/components/park/ParkPlayerCount";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-4xl font-bold">Welcome to the Park</h1>
      <ParkPlayerCount parkId="1" />
    </div>
  );
}
