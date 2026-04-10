/**
 * Platform utilities for cross-platform shell execution.
 *
 * Windows does not ship with a native `bash` in PATH. This module
 * resolves the correct shell executable so that quality-gate scripts (.sh)
 * can be launched on both Unix and Windows (via Git Bash / WSL).
 */

import { existsSync } from "fs";
import os from "os";

/**
 * Returns the absolute path to a `bash`-compatible shell executable for the
 * current operating system.
 *
 * Resolution order on Windows:
 *   1. `C:\Program Files\Git\bin\bash.exe`       (64-bit Git for Windows)
 *   2. `C:\Program Files (x86)\Git\bin\bash.exe` (32-bit Git for Windows)
 *   3. `C:\Git\bin\bash.exe`                     (custom install path)
 *   4. `"bash"` — fallback that works when Git Bash is added to the system PATH,
 *      or when running inside WSL.
 *
 * On macOS / Linux, always returns `"bash"`.
 */
export function getBashExecutable(): string {
  if (os.platform() !== "win32") return "bash";

  const candidates = [
    "C:\\Program Files\\Git\\bin\\bash.exe",
    "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
    "C:\\Git\\bin\\bash.exe",
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  // Fallback: trust that bash is somewhere in PATH (WSL, Git Bash in PATH, etc.)
  return "bash";
}

/**
 * Returns true when the current process is running on Windows.
 */
export function isWindows(): boolean {
  return os.platform() === "win32";
}
