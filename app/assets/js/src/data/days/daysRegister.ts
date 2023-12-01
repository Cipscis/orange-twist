import { Register } from 'util/register/Register';

import type { DayInfo } from './types';

/**
 * The {@linkcode Register} containing registration information for all days.
 */
export const daysRegister = new Register<string, DayInfo>();
