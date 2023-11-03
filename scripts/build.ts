import * as esbuild from 'esbuild';

import { config } from './build-config.js';

await esbuild.build(config);
