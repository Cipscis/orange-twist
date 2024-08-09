import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { toDataUrl } from './toDataUrl';

describe('toDataUrl', () => {
	test('returns a Promise that resolves to the provided image as a data URL', async () => {
		// Orange Twist's favicon
		const testImageBase64 = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNiAzNiI+PHBhdGggZmlsbD0iI0Y0OTAwQyIgZD0iTTMgMTkuNUMzIDEwLjM4OCAxMC4zODcgMyAxOS40OTkgM2M5LjExMyAwIDE2LjUgNy4zODcgMTYuNSAxNi41UzI4LjYxMiAzNiAxOS40OTkgMzZDMTAuMzg3IDM2IDMgMjguNjEzIDMgMTkuNXoiLz48cGF0aCBmaWxsPSIjNjYyMTEzIiBkPSJNMTEuNDE0IDcuNTg1Yy0uMjY3LS4yNjctLjc5Ny0uMTk3LTEuMzU1LjEyLTMuMy0yLjczMi04LjY1My0zLjY1Mi04Ljg5NS0zLjY5Mi0uNTQ2LS4wODktMS4wNTkuMjc3LTEuMTUuODIxLS4wOTEuNTQ0LjI3NiAxLjA2LjgyMSAxLjE1MS4wNTMuMDA5IDQuOTM0Ljg1NCA3LjgyMSAzLjE2LS4yNzUuNTI1LS4zMjQgMS4wMTUtLjA3IDEuMjY4LjM5LjM5MSAxLjM0LjA3NCAyLjEyMS0uNzA3Ljc4MS0uNzggMS4wOTctMS43My43MDctMi4xMjF6Ii8+PHBhdGggZmlsbD0iIzVDOTEzQiIgZD0iTTIxIDFzLTMuMTA2IDQuMzE4LTcuMDIxIDUuMjczQzExIDcgNy4wNDEgNy4wNyA2LjY0NiA2LjE1Yy0uMzk0LS45MTkgMS41NzItMy45MzcgNC45NjktNS4zOTNDMTUuMDEyLS42OTggMjEgMSAyMSAxeiIvPjwvc3ZnPg==';

		// JSDom doesn't support the fetch API, so decode the it into bytes
		// and convert it straight into a Blob

		const testImageByteString = atob(testImageBase64);
		const testImageBytes = Array.from(testImageByteString).map((el) => el.charCodeAt(0));
		const testImageBlob = new Blob(
			[new Uint8Array(testImageBytes)],
			{ type: 'image/svg' }
		);

		expect(await toDataUrl(testImageBlob)).toBe(`data:image/svg;base64,${testImageBase64}`);
	});
});
