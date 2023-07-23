import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(import.meta.url);

const entryPath = './app/assets/js/src';
const distPath = path.resolve(__dirname, '../app/assets/js/dist');

const config = {
	mode: process.env.MODE,
	entry: {
		'main': `${entryPath}/main.ts`,
	},
	output: {
		path: distPath,
		filename: '[name].js',
	},
	resolve: {
		fullySpecified: true,
		extensionAlias: {
			'js': ['ts', 'js'],
		},
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
			},
		],
	},
};

switch (process.env.MODE) {
	case 'development':
		config.optimization = {
			minimize: false,
		};
		config.devtool = 'eval-source-map';
		break;
	case 'production':
	default:
		config.devtool = 'source-map';
		break;
}

export default config;
