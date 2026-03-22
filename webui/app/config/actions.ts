"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearServerConfiguration,
  writeServerConfiguration,
} from "@/lib/server/core";

export interface ConfigurationActionResult {
  ok: boolean;
  message: string;
}

type ConfigurationField = "apiKey" | "assistantId";

export async function updateConfigurationAction(
  formData: FormData,
): Promise<void> {
  const fieldValue = formData.get("field");
  const field =
    fieldValue === "apiKey" || fieldValue === "assistantId" ? fieldValue : null;
  if (!field) {
    redirectToConfig({ error: "Unknown configuration field." });
  }

  const raw = formData.get("value");
  const value = typeof raw === "string" ? raw.trim() : "";

  if (field === "apiKey" && value.length === 0) {
    redirectToConfig({ error: "API key cannot be empty." });
  }

  if (field === "assistantId" && value.length === 0) {
    redirectToConfig({ error: "Memory Bank ID cannot be empty." });
  }

  const updates = fieldToUpdates(field, value);
  writeServerConfiguration(updates, "local");
  revalidatePath("/config");
  redirectToConfig({
    success: field === "apiKey" ? "API key saved." : "Memory Bank ID saved.",
  });
}

export async function clearConfigurationAction(
  formData: FormData,
): Promise<void> {
  const confirm = formData.get("confirm");
  const value = typeof confirm === "string" ? confirm.trim() : "";
  if (value !== "CLEAR") {
    redirectToConfig({ error: "Type CLEAR to confirm configuration reset." });
  }

  clearServerConfiguration("local");
  revalidatePath("/config");
  redirectToConfig({
    success:
      "Local configuration cleared. Effective credentials may still come from env/global.",
  });
}

function fieldToUpdates(
  field: ConfigurationField,
  value: string,
): { apiKey?: string; assistantId?: string } {
  if (field === "apiKey") {
    return { apiKey: value };
  }

  return { assistantId: value };
}

function redirectToConfig(values: { success?: string; error?: string }): never {
  const params = new URLSearchParams();
  if (values.success) {
    params.set("success", values.success);
  }
  if (values.error) {
    params.set("error", values.error);
  }

  const query = params.toString();
  redirect(query.length > 0 ? `/config?${query}` : "/config");
}
