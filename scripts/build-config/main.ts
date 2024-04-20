import type { BuildOptions } from 'esbuild';
import dotenv from 'dotenv';

import { dist, src } from './paths.js';

import packageJson from '../../package.json' with { type: 'json' };

const { version } = packageJson;

dotenv.config();

const { MODE } = process.env;
const isDev = MODE === 'development';

export const config: BuildOptions = {
	entryPoints: [
		`${src}/priority.ts`,
		`${src}/enhancements.ts`,
		`${src}/pages/main.tsx`,
		`${src}/pages/task.tsx`,
		`${src}/pages/help.tsx`,

		`${src}/pages/404.tsx`,
		`${src}/pages/408.tsx`,
	],
	outdir: dist,
	bundle: true,
	sourcemap: 'linked',

	minify: !isDev,
	define: {
		['__VERSION__']: JSON.stringify(version),
	},
};
