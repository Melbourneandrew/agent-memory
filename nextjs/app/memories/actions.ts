"use server";

export interface MemoryActionResult {
  ok: boolean;
  message: string;
}

export async function createMemoryAction(content: string): Promise<MemoryActionResult> {
  void content;
  return {
    ok: false,
    message: "Not implemented. Memory Server Actions are planned for WO-12."
  };
}

