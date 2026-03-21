import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const nextjsRoot = join(__dirname, "../..");
const forbiddenImports = [
  "@/lib/server/core",
  "@agent-memory-cli/core",
  "server-only",
  "lib/server/core",
];

describe("server-only boundaries", () => {
  test("client modules do not import server-only APIs", () => {
    const files = collectSourceFiles(join(nextjsRoot, "app")).concat(
      collectSourceFiles(join(nextjsRoot, "components")),
    );
    const clientFiles = files.filter((path) =>
      isClientModule(readFileSync(path, "utf-8")),
    );

    for (const filePath of clientFiles) {
      const source = readFileSync(filePath, "utf-8");
      for (const target of forbiddenImports) {
        expect(containsImportReference(source, target)).toBe(false);
      }
    }
  });

  test("server core entry remains server-only", () => {
    const source = readFileSync(
      join(nextjsRoot, "lib/server/core.ts"),
      "utf-8",
    );
    expect(source).toContain('import "server-only";');
  });
});

function collectSourceFiles(directory: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      result.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (!fullPath.endsWith(".ts") && !fullPath.endsWith(".tsx")) {
      continue;
    }
    result.push(fullPath);
  }
  return result;
}

function isClientModule(source: string): boolean {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines[0] === '"use client";' || lines[0] === "'use client';";
}

function containsImportReference(source: string, target: string): boolean {
  const escaped = escapeForRegExp(target);
  const patterns = [
    new RegExp(`from\\s+["']${escaped}["']`),
    new RegExp(`import\\s+["']${escaped}["']`),
    new RegExp(`import\\(\\s*["']${escaped}["']\\s*\\)`),
  ];
  return patterns.some((pattern) => pattern.test(source));
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
