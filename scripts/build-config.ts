import type { BuildOptions } from 'esbuild';

const srcPath = 'app/assets/js/src';
const dstPath = 'app/assets/js/dist';

export const config: BuildOptions = {
	entryPoints: [
		`${srcPath}/main.ts`,
	],
	outdir: dstPath,
	bundle: true,
};
