const PREVIEW_LENGTH = 150;

export function toMemoryPreview(content: string): string {
  if (content.length <= PREVIEW_LENGTH) {
    return content;
  }
  return `${content.slice(0, PREVIEW_LENGTH)}...`;
}

export function formatTimestamp(value: string): string {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function parsePositiveInt(
  raw: string | undefined,
  fallback: number,
): number {
  if (!raw) {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1) {
    return fallback;
  }

  return value;
}
