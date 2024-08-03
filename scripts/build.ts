import * as esbuild from 'esbuild';
import dotenv from 'dotenv';

import { writeMetaFile } from './utils/index.js';

import { config as mainConfig } from './build-config/main.js';
import { config as serviceWorkerConfig } from './build-config/service-worker.js';

dotenv.config();

const {
	MODE,
} = process.env;

const isDev = MODE === 'development';

// Modify this line if you want to generate meta files for prod builds when testing locally:
const writeMetaFiles = isDev;

const [mainMeta, serviceWorkerMeta] = await Promise.all([
	esbuild.build(mainConfig),
	esbuild.build(serviceWorkerConfig),
]);

if (writeMetaFiles) {
	await Promise.all([
		writeMetaFile(mainConfig, mainMeta, 'metafile-main.json'),
		writeMetaFile(serviceWorkerConfig, serviceWorkerMeta, 'metafile-service-worker.json'),
	]);
}
