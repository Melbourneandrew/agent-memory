import { executeCliCommand } from "./helpers/command-harness";

describe("CLI help command", () => {
  test("prints help text when no arguments are provided", async () => {
    const result = await executeCliCommand([]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("agent-memory <command> [options]");
    expect(result.stdout).toContain("config set <api-key|assistant-id> <value>");
    expect(result.stdout).toContain("web [--port <n>]");
    expect(result.stderr).toBe("");
  });

  test("prints help text for explicit help flags", async () => {
    const longFlag = await executeCliCommand(["--help"]);
    const shortFlag = await executeCliCommand(["-h"]);

    expect(longFlag.exitCode).toBe(0);
    expect(shortFlag.exitCode).toBe(0);
    expect(longFlag.stdout).toContain("Global flags:");
    expect(shortFlag.stdout).toContain("Commands:");
  });

  test("prints version for both version flags", async () => {
    const longFlag = await executeCliCommand(["--version"]);
    const shortFlag = await executeCliCommand(["-v"]);

    expect(longFlag.exitCode).toBe(0);
    expect(shortFlag.exitCode).toBe(0);
    expect(longFlag.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    expect(shortFlag.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
