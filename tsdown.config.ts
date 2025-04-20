import { defineConfig } from "tsdown";

const config: ReturnType<typeof defineConfig> = defineConfig({
	outDir: "dist",
	entry: "src/*.ts",
	fixedExtension: true,
	dts: false,
  outputOptions: {
    banner: "#!/usr/bin/env node\n",
  },
	publint: true,
	unused: { level: "error" },
  clean: true,
});

export default config;
