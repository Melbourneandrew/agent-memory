import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { readLocalServerConfiguration, resolveServerConfiguration } from "@/lib/server/core";

import { updateConfigurationAction } from "./actions";
import { ClearConfigurationForm } from "./clear-config-form";

interface ConfigurationPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

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

export default async function ConfigurationPage({ searchParams }: ConfigurationPageProps) {
  const params = await searchParams;
  const localConfig = readLocalServerConfiguration();
  const configuration = resolveServerConfiguration();
  const successMessage = firstValue(params.success);
  const errorMessage = firstValue(params.error);
  const hasApiKey = Boolean(configuration.apiKey?.trim());

  return (
    <section className="space-y-4">
      {!hasApiKey ? (
        <Alert>
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            Set your API key below, or run <code>agent-memory config set api-key &lt;your-api-key&gt;</code>{" "}
            in your terminal.
          </AlertDescription>
        </Alert>
      ) : null}
      {successMessage ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Could not update configuration</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Key</CardTitle>
            <CardDescription>
              Stored in local workspace config for this project. Effective runtime config can still
              include environment/global fallbacks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-mono text-sm">{maskApiKey(localConfig.values.apiKey)}</p>
            <p className="text-xs text-muted-foreground">
              Effective API key status: {hasApiKey ? "Configured" : "Not configured"}
            </p>
            <form action={updateConfigurationAction} className="space-y-2">
              <input type="hidden" name="field" value="apiKey" />
              <Input name="value" type="password" placeholder="sk-..." autoComplete="off" />
              <Button type="submit">Save API key</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Memory Bank ID</CardTitle>
            <CardDescription>
              Backboard assistant ID used to group memories in the active workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-mono text-sm">
              {localConfig.values.assistantId ?? "Will be auto-created on first memory operation."}
            </p>
            <p className="text-xs text-muted-foreground">
              Effective Memory Bank ID: {configuration.assistantId ?? "Not configured"}
            </p>
            <form action={updateConfigurationAction} className="space-y-2">
              <input type="hidden" name="field" value="assistantId" />
              <Input name="value" placeholder="asst_..." autoComplete="off" />
              <Button type="submit" variant="outline">
                Save Memory Bank ID
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reset Configuration</CardTitle>
          <CardDescription>
            Clear local configuration when switching credentials or resetting your workspace setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClearConfigurationForm />
        </CardContent>
      </Card>
    </section>
  );
}

function firstValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

