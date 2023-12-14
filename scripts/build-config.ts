import type { BuildOptions } from 'esbuild';

import dotenv from 'dotenv';
dotenv.config();

const { MODE } = process.env;

const srcPath = 'app/assets/js/src';
const dstPath = 'app/assets/js/dist';

const isDev = MODE === 'development';

export const config: BuildOptions = {
	entryPoints: [
		`${srcPath}/priority.ts`,
		`${srcPath}/main.tsx`,
		`${srcPath}/task.tsx`,
	],
	outdir: dstPath,
	bundle: true,
	sourcemap: 'linked',

	minify: !isDev,
};
