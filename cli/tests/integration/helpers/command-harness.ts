import { PassThrough } from "node:stream";

import type { CliCommandHandlers } from "../../../src/commands";
import { runCli } from "../../../src/cli";

interface CliExecutionResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export async function executeCliCommand(
  args: string[],
  options?: {
    handlers?: CliCommandHandlers;
  }
): Promise<CliExecutionResult> {
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  stdout.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
  stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

  const exitCode = await runCli(
    args,
    {
      stdout: stdout as unknown as NodeJS.WriteStream,
      stderr: stderr as unknown as NodeJS.WriteStream
    },
    options?.handlers
  );

  stdout.end();
  stderr.end();

  return {
    exitCode,
    stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
    stderr: Buffer.concat(stderrChunks).toString("utf-8")
  };
}
