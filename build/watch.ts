import * as esbuild from 'esbuild';

import { config } from './config.js';

const context = await esbuild.context({
	...config,
});

context.watch();
