import * as esbuild from 'esbuild';

import { config as mainConfig } from './build-config/main.js';
import { config as serviceWorkerConfig } from './build-config/service-worker.js';

await Promise.all([
	esbuild.build(mainConfig),
	esbuild.build(serviceWorkerConfig),
]);
