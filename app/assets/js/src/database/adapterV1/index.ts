export { dbV1 } from './dbV1';

import { getDaysV1 } from './getDaysV1';
import { setDaysV1 } from './setDaysV1';
import { getDayTasksV1 } from './getDayTasksV1';
import { setDayTasksV1 } from './setDayTasksV1';
import { getTasksV1 } from './getTasksV1';
import { setTasksV1 } from './setTasksV1';
import { getTemplatesV1 } from './getTemplatesV1';
import { setTemplatesV1 } from './setTemplatesV1';
import { getImageV1 } from './getImageV1';
import { setImageV1 } from './setImageV1';
import { getImagesV1 } from './getImagesV1';

/**
 * An API for interacting with the database v2 using types from the database schema v1.
 */
export const adapterV1 = {
	getDays: getDaysV1,
	setDays: setDaysV1,
	getDayTasks: getDayTasksV1,
	setDayTasks: setDayTasksV1,
	getTasks: getTasksV1,
	setTasks: setTasksV1,
	getTemplates: getTemplatesV1,
	setTemplates: setTemplatesV1,
	getImage: getImageV1,
	setImage: setImageV1,
	getImages: getImagesV1,
};
