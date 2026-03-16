import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MemoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MemoryDetailPage({ params }: MemoryDetailPageProps) {
  const { id } = await params;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Detail</CardTitle>
        <CardDescription>Placeholder detail route for memory-specific views.</CardDescription>
      </CardHeader>
      <CardContent className="font-mono text-sm">Memory ID: {id}</CardContent>
    </Card>
  );
}

