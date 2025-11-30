import {
	describe,
	expect,
	test,
} from '@jest/globals';

import * as z from 'zod/mini';

import { isZodSchemaType } from 'utils';

describe('isZodSchemaType', () => {
	test('constructs a typeguard function when passed a Zod schema', () => {
		const schema = z.object({
			foo: z.string(),
		});

		const typeguard = isZodSchemaType(schema);
		expect(typeof typeguard).toBe('function');

		const match = { foo: 'string' };
		const noMatch = { bar: 'string' };

		const matchResult = typeguard(match);
		expect(matchResult).toBe(true);
		if (matchResult) {
			// Check the typeguard worked - positive result
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			const test = { ...match } satisfies z.infer<typeof schema>;
		}

		const noMatchResult = typeguard(noMatch);
		expect(noMatchResult).toBe(false);
		if (!noMatchResult) {
			// Check the typeguard worked - negative result
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			const test = {
				...noMatch,
			// @ts-expect-error The match failed so it should *not* satisfy the schema's type
			} satisfies z.infer<typeof schema>;
		}
	});
});
