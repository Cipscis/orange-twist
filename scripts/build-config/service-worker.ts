import type { BuildOptions } from 'esbuild';
import dotenv from 'dotenv';

import { root, src } from './paths.js';

dotenv.config();

const { MODE } = process.env;
const isDev = MODE === 'development';

export const config: BuildOptions = {
	entryPoints: [`${src}/service-worker/index.ts`],
	outfile: `${root}/service-worker.js`,
	bundle: true,
	sourcemap: 'linked',
	metafile: true,
	minify: !isDev,
};
