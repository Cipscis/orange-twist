import { daysRegister } from './daysRegister';

/**
 * Deletes all days. Primarily useful for clearing data during testing.
 */
export function deleteAllDays(): void {
	daysRegister.clear();
}
