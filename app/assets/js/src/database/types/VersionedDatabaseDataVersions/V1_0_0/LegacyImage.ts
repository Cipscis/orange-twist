import * as z from 'zod/mini';

export const legacyImageSchema = z.union([
	z.url({
		protocol: /^data$/,
	}),
	z.instanceof(Blob),
]);
