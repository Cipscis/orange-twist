// It's fine to use any in extends

import type { Register } from './Register';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type RegisterKey<R extends Register<any, any>> = R extends Register<infer K, any> ? K : never;
