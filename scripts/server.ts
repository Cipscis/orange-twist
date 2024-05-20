import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();
const app = express();

const port = process.env.PORT;

app.use(express.static('app'));

// Anything not already handled is a 404
app.get('*', (request, response, next) => {
	response.status(404).sendFile(join(__dirname, '../app/404.html'));
});

app.listen(port, () => {});
console.log(`Listening on port ${port}`);
