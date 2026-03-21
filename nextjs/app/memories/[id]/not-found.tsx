import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function MemoryNotFound() {
  return (
    <section className="space-y-4">
      <Alert>
        <AlertTitle>Memory not found</AlertTitle>
        <AlertDescription>
          The requested memory ID does not exist for the current memory bank.
        </AlertDescription>
      </Alert>
      <Button asChild variant="outline">
        <Link href="/memories">Back to memories</Link>
      </Button>
    </section>
  );
}
