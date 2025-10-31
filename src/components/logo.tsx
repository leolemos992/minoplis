import { cn } from "@/lib/utils";
import { Landmark } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center font-headline text-2xl font-bold tracking-tight", className)}>
      <Landmark className="mr-2 h-6 w-6 text-primary" />
      <span>MINOPLIS</span>
    </div>
  );
}
