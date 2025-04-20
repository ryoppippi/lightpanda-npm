import fs from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { glob } from 'tinyglobby';

import downloadRelease from 'download-github-release';

const packagesPath = await glob(join(import.meta.dirname, '../packages/*/package.json'), { absolute: true }).then((paths) => paths.map(p=>dirname(p)));

const promises = [];

for (const pkgPath of packagesPath) {
  console.log(`Downloading binary for ${pkgPath}...`);
  const arch = pkgPath.includes('aarch64') ? 'arm64' : 'x86_64';
  const os = pkgPath.includes('macos') ? 'darwin' : 'linux';

  promises.push(
    downloadRelease(
      /* user */ 'lightpanda-io',
      /* repo */ 'browser',
      /* outputDir */ pkgPath,
      /* filterRelease */ ((release: any) => (release.tag_name === 'nightly') as unknown) as ()=> boolean,
      /* filterAsset */ (asset) => (asset.name.includes(os) && asset.name.includes(arch)),
      /* leaveZipped */ false,
    ).then(async () => {
        /** rename binary to 'lightpanda' */
        const newPath = join(pkgPath, 'lightpanda');
        const [oldPath] = await glob(join(pkgPath, 'lightpanda-*'), { absolute: true });
        if (!oldPath) {
          throw new Error(`Failed to find binary in ${pkgPath}`);
        }
        fs.rename(oldPath, newPath);
      })
  )
}

await Promise.all(promises);
