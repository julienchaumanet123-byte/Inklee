import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ClientsLoading() {
  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Card>
        <div className="divide-y divide-ink-800/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4">
              <div className="col-span-4 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="col-span-4">
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="col-span-2">
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="col-span-2 text-right">
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
