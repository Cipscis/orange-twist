// Type-only import to make the symbol available for JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { formatDate } from '../formatters/date.js';

import { Day } from '../types/Day.js';

/**
 * A register of {@linkcode Day} objects, indexed by ISO 8601
 * date strings of the form `YYYY-MM-DD`, which can be generated
 * by {@linkcode formatDate}
 */
export const dayRegister: Map<string, Day> = new Map();
