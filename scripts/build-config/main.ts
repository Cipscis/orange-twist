import type { BuildOptions } from 'esbuild';

import { getEnv } from '../utils/index.js';
import { dist, src } from './paths.js';

import packageJson from '../../package.json' with { type: 'json' };

const env = getEnv();

const {
	MODE,
	SHOW_FPS,
} = env;
const isDev = MODE === 'development';
const showFps = Boolean(SHOW_FPS && SHOW_FPS !== 'false');

const version = packageJson.version + (isDev ? '-next' : '');

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
	metafile: true,
	minify: !isDev,
	define: {
		['__VERSION__']: JSON.stringify(version),
		['__IS_DEV__']: JSON.stringify(isDev),
		['__SHOW_FPS_COUNTER__']: JSON.stringify(showFps),
	},
};
