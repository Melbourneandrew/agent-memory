const DEFAULT_TIMEOUT_MS = 5000;

export async function runPing(endpoint: string): Promise<number> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.status;
  } finally {
    clearTimeout(timeout);
  }
}
