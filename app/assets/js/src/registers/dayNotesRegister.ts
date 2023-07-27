import { formatDate } from '../formatters/date.js';

const dayNotesRegister = new Map<string, string>();

export function getAllDayNotes(): Array<[string, string]> {
	const allDayNotes = Array.from(dayNotesRegister.entries());

	// Make sure they're sorted
	allDayNotes.sort(([dayA], [dayB]) => dayA.localeCompare(dayB));

	return allDayNotes;
}

export function getDayNote(day: string): string | null {
	return dayNotesRegister.get(day) ?? null;
}

export function setDayNote(day: string, note: string): void {
	dayNotesRegister.set(day, note);
}


// Temporary test data
dayNotesRegister.set(formatDate(new Date(2023, 6, 26)), 'Test note 1');
dayNotesRegister.set(formatDate(new Date(2023, 6, 27)), 'Test note 2');
