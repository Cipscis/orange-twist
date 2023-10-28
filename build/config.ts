import { BuildOptions } from 'esbuild';

const srcPath = 'app/assets/js/src';
const dstPath = 'app/assets/js/dist';

export const config: BuildOptions = {
	entryPoints: [
		`${srcPath}/priority.ts`,
		`${srcPath}/main.tsx`,
		`${srcPath}/task.tsx`,
	],
	outdir: dstPath,
	bundle: true,
};
