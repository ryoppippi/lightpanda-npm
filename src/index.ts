import fs from 'node:fs/promises';
import { platform, arch } from 'node:os';
import { join } from 'node:path';
import findCacheDirectory from 'find-cache-directory';
import downloadRelease from 'download-github-release';

export const PLATFORMS ={
  linux: {
    arm64: 'lightpanda-aarch64-linux',
    x64: 'lightpanda-x86_64-linux'
  },
  darwin: {
    arm64: 'lightpanda-aarch64-macos',
    x64: 'lightpanda-x86_64-macos'
  },
}

export const lightpandaCacheDir = findCacheDirectory({ name: 'lightpanda', create: true });

export async function downloadNightly({
  cacheDir,
  // @ts-ignore
  targetPlatformPath = PLATFORMS[platform()][arch()],
}: {
    cacheDir: string,
    targetPlatformPath: string,
  }) {

  const binaryPath = join(cacheDir, targetPlatformPath);

  /* download the latest release */
  await downloadRelease(
    /* user */ 'lightpanda-io',
    /* repo */ 'browser',
    /* outputDir */ cacheDir,
    /* filterRelease */ (((release: any) => (release.tag_name === 'nightly') as unknown) as () => boolean),
    /* filterAsset */ (asset) => (asset.name === targetPlatformPath),
    /* leaveZipped */ false,
  )

  /* make the binary executable */
  fs.chmod(binaryPath, 0o755)
}
