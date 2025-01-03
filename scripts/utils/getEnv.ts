import { writeFileSync } from 'node:fs';

import dotenv from 'dotenv';

const defaultEnv = `MODE = "development"
PORT = "8080"
SHOW_FPS = "false"`;

function init() {
	try {
		// If no .env file exists, create one first
		writeFileSync('.env', defaultEnv, { flag: 'wx' });
		console.log('Creating default .env file');
	} catch (e) {
		// If a .env file exists, just continue
	}

	dotenv.config();
}

export function getEnv(): Partial<Record<string, string>> {
	init();

	return process.env;
}
