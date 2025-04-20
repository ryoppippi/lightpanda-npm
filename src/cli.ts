import fs from 'node:fs/promises';
import process from 'node:process';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { platform, arch, version, release } from 'node:os';
import { downloadNightly, lightpandaCacheDir, PLATFORMS } from './index';

/**
 * NPM, Yarn, and other package manager set the `npm_config_user_agent`. It has the following format:
 *
 * ```
 * "npm/8.3.0 node/v16.13.2 win32 x64 workspaces/false
 * ```
 *
 * @returns The package manager string (`npm/8.3.0`) or null if the user agent string isn't set.
 */
function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent == null) {
    return null;
  }

  return userAgent.split(" ")[0];
}

/* check if the cache directory exists */
if (!lightpandaCacheDir) {
  throw new Error('Failed to find cache directory');
}


// @ts-ignore
const targetPlatformPath = PLATFORMS[platform()][arch()]

if (!targetPlatformPath) {
  throw new Error(`Unsupported platform: ${platform()}-${arch()}`);
}

const binaryPath = join(lightpandaCacheDir, targetPlatformPath);

/* check if the binary is executable */
try {
  await fs.access(binaryPath, fs.constants.X_OK);
}
catch (err) {
  await downloadNightly({
    cacheDir: lightpandaCacheDir,
    targetPlatformPath,
  })
  /* binary does not exist or is not executable */
  console.log('Binary does not exist or is not executable, downloading...');

}

if(binaryPath) {
  const packageManager = detectPackageManager();
  const result = spawnSync(
    binaryPath,
    process.argv.slice(2),
    {
      shell: false,
      stdio: "inherit",
      env: {
        ...process.env,
        JS_RUNTIME_VERSION: version(),
        JS_RUNTIME_NAME: release.name,
        ...(packageManager != null
          ? { NODE_PACKAGE_MANAGER: packageManager }
          : {}),
      },
    },
  );

  if (result.error) {
    throw result.error;
  }

  // @ts-ignore
  process.exitCode = result.status;
} else {
  console.error(
    "The Lightpanda CLI is not available for your platform. " +
      "You can still use the CLI by cloning the biome/tools repo from GitHub, " +
      "and follow the instructions there to build the CLI for your platform.",
  );
  process.exitCode = 1;
}
