#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const claudeCommand = process.env.CLAUDE_CODE_BIN || "claude";
const args = ["--plugin-dir", pluginRoot, ...process.argv.slice(2)];
const child = spawn(claudeCommand, args, {
    stdio: "inherit",
    env: process.env
});

child.on("error", error => {
    if (error.code === "ENOENT") {
        console.error("claude-octoglyphs could not find Claude Code. Install Claude Code or set CLAUDE_CODE_BIN to its executable path.");
        process.exit(127);
    }

    console.error(`claude-octoglyphs failed to launch Claude Code: ${error.message}`);
    process.exit(1);
});

child.on("exit", (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }

    process.exit(code ?? 0);
});
