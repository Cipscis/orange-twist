export type DatabaseData = {
	schemaVersion: '2.0.0';
	day: {
		id: number;
		year: number;
		month: number;
		day: number;
		note: string;
	}[];
	task: {
		id: number;
		name: string;
		note: string;
		sortIndex: number | null;
		status: number;
	}[];
	day_task: {
		id: number;
		day: number;
		task: number;
		note: string;
		summary: string;
		sortIndex: number | null;
		status: number;
	}[];
	status: {
		id: number;
		name: string;
		isComplete: boolean;
		// TODO: Colour? Icon?
	}[];
	template: {
		id: number;
		name: string;
		template: string;
		sortIndex: number | null;
	}[];
	image: {
		id: number;
		hash: string;
		file: Blob;
	}[];
};
