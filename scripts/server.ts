import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();

const port = process.env.PORT;
const projectName = process.env.PROJECT_NAME;

if (projectName) {
	// GitHub Pages publishes projects to <username>.github.io/<projectname>
	// This breaks root-relative URLs, so instead use "/projectname/path/" locally
	// and resolve it by redirecting it here to a root relative path.
	const ghPagesPathPattern = new RegExp(`^/${projectName}(/|$)`, 'i');

	app.use((request, res, next) => {
		if (!ghPagesPathPattern.test(request.url)) {
			res.status(404);
			res.send(`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>Error</title>
	</head>
	<body>
		<pre>Cannot GET ${request.url}
Did you mean <a href="/${projectName}${request.url}">/${projectName}${request.url}</a>?</pre>
	</body>
</html>`);
			return;
		}

		request.url = request.url.replace(ghPagesPathPattern, '/');
		next();
	});
}

app.use(express.static('app'));

app.listen(port, () => {});
console.log(`Listening on port ${port}`);
