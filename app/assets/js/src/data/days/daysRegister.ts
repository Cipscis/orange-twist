import { Register } from 'utils';

import type { DayInfo } from './types';

/**
 * The {@linkcode Register} containing registration information for all days.
 */
export const daysRegister = new Register<string, DayInfo>();
