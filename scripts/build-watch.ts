import * as esbuild from 'esbuild';

import { config as mainConfig } from './build-config/main.js';
import { config as serviceWorkerConfig } from './build-config/service-worker.js';

const mainContext = await esbuild.context({ ...mainConfig });
const serviceWorkerContext = await esbuild.context({ ...serviceWorkerConfig });

mainContext.watch();
serviceWorkerContext.watch();
