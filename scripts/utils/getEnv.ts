import { writeFileSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

const defaultEnv = `MODE = "development"
PORT = "8080"
SHOW_FPS = "false"`;

function init() {
	try {
		// If no .env file exists, create one first
		writeFileSync('.env', defaultEnv, { flag: 'wx' });
		console.log('Creating default .env file');
		loadEnvFile('.env');
	} catch (e) {
		// If a .env file exists, just continue
	}
}

export function getEnv(): Partial<Record<string, string>> {
	init();

	return process.env;
}
