export { adapterV1, dbV1 } from './adapterV1';
export {
	save,
	SaveType,
	type SaveAction,

	ChangeEntityType,

	LiveTask,
	LiveStatusForTask,
	LiveTaskWithStatus,
	LiveSettableUnfinishedTaskIds,
	LiveCompletedTaskIds,
	SettableLiveTemplate,

	loadDay,
	useDay,
	useSettableDay,
	loadDayByDate,
	loadCurrentDay,
	useCurrentDay,
	loadAllDays,
	useAllDayIds,

	loadTask,
	useTask,
	useSettableTask,
	useSettableUnfinishedTaskIds,
	useCompletedTaskIds,

	loadDayTask,
	loadDayTaskForDayAndTask,
	loadDayTaskIdsForDay,
	useDayTaskIdsForDay,
	useSettableDayTaskIdsForDay,
	loadDayTaskIdsForTask,
	useDayTaskIdsForTask,
	useSettableDayTask,
	useCurrentDayTaskForTask,

	loadStatus,
	useStatus,
	loadStatusForTask,
	useSettableStatusForTask,
	loadAllStatuses,
	useAllStatuses,

	loadTemplate,
	useSettableTemplate,
} from './access';

export type {
	Day,
	Task,
	DayTask,
	Status,
	Template,
	Image,
} from './types';

export {
	getDayName,
	getDayNameParts,
} from './utils';

export {
	createTestData,
	insertTestData,
} from './test-utils';
