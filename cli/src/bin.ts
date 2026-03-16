#!/usr/bin/env node

import { runCli } from "./cli";

runCli(process.argv.slice(2))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown CLI startup error.";
    process.stderr.write(`CLI failed to start: ${message}\n`);
    process.exitCode = 1;
  });
