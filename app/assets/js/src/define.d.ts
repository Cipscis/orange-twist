/**
 * @file This file declares constants that are replaced during the build process.
 */

/** The current version of the app, read out of the package.json file. */
declare const __VERSION__: string;

/** Whether or not the current build is in development mode. */
declare const __IS_DEV__: boolean;

/** Whether or not to show the FPS counter (only in development mode). */
declare const __SHOW_FPS_COUNTER__: boolena;
