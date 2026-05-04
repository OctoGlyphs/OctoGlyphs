#!/usr/bin/env node
import { chmod, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(pluginRoot, "bin/claude-octoglyphs.mjs");
const installDir = resolve(process.env.OCTOGLYPHS_BIN_DIR || process.env.HOME || ".", process.env.OCTOGLYPHS_BIN_DIR ? "." : ".local/bin");
const target = resolve(installDir, "claude-octoglyphs");

await mkdir(installDir, { recursive: true });
await chmod(source, 0o755);
await rm(target, { force: true });

try {
    await symlink(source, target);
} catch {
    await writeFile(target, `#!/bin/sh\nexec node "${source}" "$@"\n`, { mode: 0o755 });
}

await chmod(target, 0o755);

console.log(`Installed claude-octoglyphs to ${target}`);

try {
    await access(installDir, constants.X_OK);
} catch {
    console.log(`Warning: ${installDir} may not be executable by your user.`);
}

if ((process.env.PATH || "").split(":").includes(installDir) === false) {
    console.log(`${installDir} is not currently in PATH.`);
    console.log("Add this to your shell profile if claude-octoglyphs is not found:");
    console.log(`export PATH=\"${installDir}:$PATH\"`);
}
