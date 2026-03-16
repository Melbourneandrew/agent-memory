import { executeCliCommand } from "./helpers/command-harness";

describe("CLI config command parsing", () => {
  test("fails when config subcommand is missing", async () => {
    const result = await executeCliCommand(["config"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Missing config subcommand");
  });

  test("fails when config set is missing required values", async () => {
    const result = await executeCliCommand(["config", "set", "api-key"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Missing required argument(s) for `config set`");
  });

  test("routes config show to handler", async () => {
    const result = await executeCliCommand(["config", "show"], {
      handlers: {
        add: async () => undefined,
        search: async () => undefined,
        get: async () => undefined,
        list: async () => undefined,
        update: async () => undefined,
        delete: async () => undefined,
        configSet: async () => undefined,
        configShow: async ({ writeStdout }) => {
          writeStdout("config shown\n");
        },
        configClear: async () => undefined,
        stats: async () => undefined,
        status: async () => undefined,
        web: async () => undefined
      }
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("config shown");
    expect(result.stderr).toBe("");
  });

  test("rejects unexpected arguments for config show", async () => {
    const result = await executeCliCommand(["config", "show", "extra"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unexpected argument(s) for `config show`.");
  });
});
