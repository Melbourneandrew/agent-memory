import { executeCliCommand } from "./helpers/command-harness";

describe("CLI help command", () => {
  test("prints help text when no arguments are provided", async () => {
    const result = await executeCliCommand([]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("agent-memory <command> [options]");
    expect(result.stderr).toBe("");
  });
});
