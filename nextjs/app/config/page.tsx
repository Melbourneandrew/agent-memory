import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveServerConfiguration } from "@/lib/server/core";

function maskApiKey(apiKey: string | null): string {
  if (!apiKey) {
    return "Not configured";
  }

  if (apiKey.length <= 4) {
    return "********";
  }

  const visible = apiKey.slice(-4);
  return `********${visible}`;
}

export default function ConfigurationPage() {
  const configuration = resolveServerConfiguration();

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>Resolved from env/local/global config with standard precedence.</CardDescription>
        </CardHeader>
        <CardContent className="font-mono text-sm">{maskApiKey(configuration.apiKey)}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Memory Bank ID</CardTitle>
          <CardDescription>
            Backboard assistant ID used to group memories in the active workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="font-mono text-sm">
          {configuration.assistantId ?? "Will be auto-created on first memory operation."}
        </CardContent>
      </Card>
    </section>
  );
}

