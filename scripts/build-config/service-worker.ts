import type { BuildOptions } from 'esbuild';

import { getEnv } from '../utils/index.js';
import { root, src } from './paths.js';

const env = getEnv();

const { MODE } = env;
const isDev = MODE === 'development';

export const config: BuildOptions = {
	entryPoints: [`${src}/service-worker/index.ts`],
	outfile: `${root}/service-worker.js`,
	bundle: true,
	sourcemap: 'linked',
	metafile: true,
	minify: !isDev,
	define: {
		['__IS_DEV__']: JSON.stringify(isDev),
	},
};
