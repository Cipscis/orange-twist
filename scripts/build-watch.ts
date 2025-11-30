import * as esbuild from 'esbuild';

import { config as mainConfig } from './build-config/main.ts';
import { config as serviceWorkerConfig } from './build-config/service-worker.ts';

const mainContext = await esbuild.context({ ...mainConfig });
const serviceWorkerContext = await esbuild.context({ ...serviceWorkerConfig });

mainContext.watch();
serviceWorkerContext.watch();
