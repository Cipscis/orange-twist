import type { BuildOptions } from 'esbuild';
import dotenv from 'dotenv';

import { dist, src } from './paths.js';

dotenv.config();

const { MODE } = process.env;
const isDev = MODE === 'development';

export const config: BuildOptions = {
	entryPoints: [
		`${src}/priority.ts`,
		`${src}/enhancements.ts`,
		`${src}/pages/main.tsx`,
		`${src}/pages/task.tsx`,
		`${src}/pages/404.tsx`,
	],
	outdir: dist,
	bundle: true,
	sourcemap: 'linked',

	minify: !isDev,
};
