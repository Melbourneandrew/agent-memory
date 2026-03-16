"use server";

import { redirect } from "next/navigation";

export interface MemoryActionResult {
  ok: boolean;
  message: string;
}

const SEARCH_QUERY_PARAM = "query";

export async function searchMemoriesAction(formData: FormData): Promise<void> {
  const raw = formData.get("query");
  const query = typeof raw === "string" ? raw.trim() : "";
  if (!query) {
    redirect("/memories");
  }

  const encoded = encodeURIComponent(query);
  redirect(`/memories?${SEARCH_QUERY_PARAM}=${encoded}`);
}

export async function createMemoryAction(content: string): Promise<MemoryActionResult> {
  void content;
  return {
    ok: false,
    message: "Not implemented. Memory Server Actions are planned for WO-12."
  };
}

