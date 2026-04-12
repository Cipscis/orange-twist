import type { LegacyStatusName } from './LegacyStatusName';

export type LegacyExportDataV1_0_0 = {
	// TODO: Actual export data won't have this
	schemaVersion: '1.0.0';
	days: [string, {
		name: string;
		note: string;
		tasks: readonly number[];
	}][];
	tasks: [number,
		| {
			id: number;
			name: string;
			status: LegacyStatusName;
		}
		| {
			id: number;
			name: string;
			status: LegacyStatusName;
			note: string;
		}
		| {
			id: number;
			name: string;
			status: LegacyStatusName;
			note: string;
			sortIndex: number;
		}
	][];
	dayTasks: [`${string}_${number}`,
		| {
			dayName: string;
			taskId: number;
			status: LegacyStatusName;
			note: string;
		}
		| {
			status: LegacyStatusName;
			note: string;
			summary: string;
		}
	][];
	templates?: [number, {
		id: number;
		name: string;
		template: string;
		sortIndex: number;
	}][];
	images?: [
		string,
		// Blobs get serialised to a Data URL for export data
		| string
		| Blob
	][];
};
