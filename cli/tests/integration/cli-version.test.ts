import { executeCliCommand } from "./helpers/command-harness";

describe("CLI version command", () => {
  test("prints package version", async () => {
    const result = await executeCliCommand(["--version"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    expect(result.stderr).toBe("");
  });
});
