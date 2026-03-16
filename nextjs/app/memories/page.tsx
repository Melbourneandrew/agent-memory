import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MemoriesPage() {
  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Memory List</CardTitle>
          <CardDescription>
            Placeholder Server Component for memory list, stats, and pagination.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

