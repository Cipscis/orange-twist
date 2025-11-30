import { writeFile } from 'node:fs/promises';

import type { BuildOptions, BuildResult } from 'esbuild';

function getMetaFilePath(config: BuildOptions): string {
	if (config.outdir) {
		return config.outdir;
	}

	if (config.outfile) {
		// Remove everything starting at the last slash
		return config.outfile.replace(/\/.+?$/, '');
	}

	throw new Error('Can\'t determine output path');
}

/**
 * Write an esbuild "metafile" to disk. This can be analysed with the
 * [esbuild Bundle Size Analyser](https://esbuild.github.io/analyze/).
 */
export async function writeMetaFile(
	config: BuildOptions,
	result: BuildResult<BuildOptions>,
	filename = 'metafile.json'
): Promise<void> {
	if (!result.metafile) {
		return;
	}

	const path = `${getMetaFilePath(config)}/${filename}`;
	return writeFile(path, JSON.stringify(result.metafile, null, '\t'));
}
