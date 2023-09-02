# orange-twist

![Build and deploy status badge](https://github.com/cipscis/orange-twist/actions/workflows/build-and-deploy.yml/badge.svg)

[Orange Twist](https://cipscis.github.io/orange-twist/)

## Development

You will need to install [Node.js](https://nodejs.org/en/) before working on this project.

1. Clone the repository using `git clone https://github.com/cipscis/orange-twist.git`.
2. Run `npm install` to install development dependencies.
3. Create a [`.env`](#env) file.
4. Run `npm start` to run the local server and watch CSS and JS files for changes.

Usually, you will just want to run `npm start`, but this project creates the following npm scripts:

* `npm run server` runs a Node.js server on the port specified in the [`.env`](#env) file, using [Express](https://expressjs.com/).

* `npm run build` compiles CSS files using [gulp-sass](https://www.npmjs.com/package/gulp-sass), then compiles TypeScript and bundles JavaScript using [Webpack](https://webpack.js.org/).

* `npm run watch` first runs the `build` task, then watches the relevant directories and reruns the `build` task if it sees any changes.

* `npm run lintJs` lints all JavaScript and TypeScript files using [eslint](https://www.npmjs.com/package/eslint).

* `npm run lintCss` lints all SCSS files using [stylelint](https://www.npmjs.com/package/stylelint).

* `npm run lint` runs the `lintJs` and `lintCss` scripts.

* `npm start` runs both the `server` and `watch` tasks simultaneously.

* `npm test` lints and compiles any TypeScript.

* `npm run prepare` first removes directories containing compiled files, then runs the `test` script. You should never need to run this script manually, [the `prepare` script runs automatically](https://docs.npmjs.com/cli/v7/using-npm/scripts#life-cycle-scripts) after you run `npm install`.

### .env

The `.env` file contains the following environment variables:

* `PROJECT_NAME` `(string)`

If present, used by [Express](https://expressjs.com/) to set up redirects for emulating [GitHub Pages](#github-pages).

* `MODE` `(string 'development' | 'production')`

Used by Webpack to determine what optimisations to use and how to generate sourcemaps.

* `PORT` `(int)`

Used by [Express](https://expressjs.com/) to determine which port to use when running a local Node.js server.

An example `.env` file you can use for development is:

```
PROJECT_NAME = "orange-twist"
MODE = "development"
PORT = "8080"
```

This file is intended to differ from environment to environment, so it is ignored by Git.

## Dependencies

* [Preact](https://preactjs.com/): Rendering framework, alternative to React.

* [htm](https://www.npmjs.com/package/htm): A library for using JSX-like syntax without a build system, using template literals.

* [zod](https://zod.dev/): A library for writing type schemas, designed for working with TypeScript.

* [marked](https://marked.js.org/): A Markdown compiler.

* [classnames](https://www.npmjs.com/package/classnames): Utility library for combining CSS classnames.

## Dev Dependencies

### Development

These dependencies are used when working on the project locally.

* [Node.js](https://nodejs.org/en/): Runtime environment

* [ts-node](https://typestrong.org/ts-node/): Allows TypeScript code to be run in a Node.js environment

* [npm](https://www.npmjs.com/): Package manager

* [Gulp](https://gulpjs.com/): Task runner

* [TypeScript](https://www.typescriptlang.org/): JavaScript extension for static type checking

* [sass](https://www.npmjs.com/package/sass): Compiling CSS from [Sass](https://sass-lang.com/)

	* [gulp-sass](https://www.npmjs.com/package/gulp-sass): Using the `sass` compiler with Gulp

* [Webpack](https://webpack.js.org/): For JavaScript dependency management, used with Gulp

	* [ts-loader](https://github.com/TypeStrong/ts-loader): For compiling TypeScript using Webpack

* [Express](https://expressjs.com/): Running a Node.js server, accessed at `http://localhost:<PORT>`

* [Concurrently](https://www.npmjs.com/package/concurrently): Running server and development build tasks concurrently

* [dotenv](https://www.npmjs.com/package/dotenv): Reading environment variables from [`.env`](#env) file

* [eslint](https://www.npmjs.com/package/eslint): Linting TypeScript files

	* [@typescript-eslint/eslint-plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin): Allows `eslint` to lint TypeScript

	* [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser): Allows `eslint` to parse TypeScript

	* [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks): Provides React/Preact linting rules

* [stylelint](https://www.npmjs.com/package/stylelint): Linting CSS

	* [stylelint-config-recommended-scss](https://www.npmjs.com/package/stylelint-config-recommended-scss): Allows `stylelint` to lint SCSS files, and provides a base set of SCSS linting rules

### Deploy

These dependencies are used for deploying the project to GitHub Pages.

* [checkout](https://github.com/marketplace/actions/checkout): Used to check out the repository to a workspace so it can be built

* [Deploy to GitHub Pages](https://github.com/marketplace/actions/deploy-to-github-pages): Used to deploy the project to GitHub pages once it has been built
