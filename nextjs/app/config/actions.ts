"use server";

export interface ConfigurationActionResult {
  ok: boolean;
  message: string;
}

export async function updateConfigurationAction(
  apiKey: string | null,
  assistantId: string | null
): Promise<ConfigurationActionResult> {
  void apiKey;
  void assistantId;
  return {
    ok: false,
    message: "Not implemented. Configuration Server Actions are planned for WO-13."
  };
}

