import type { ObjectStoreName } from '../metadata';

import type { DatabaseDataV2_0_0 } from './VersionedDatabaseData';

export type DatabaseData = DatabaseDataV2_0_0;

export type Day = DatabaseData[typeof ObjectStoreName.DAY][number];
export type Task = DatabaseData[typeof ObjectStoreName.TASK][number];
export type DayTask = DatabaseData[typeof ObjectStoreName.DAY_TASK][number];
export type Status = DatabaseData[typeof ObjectStoreName.STATUS][number];
export type Template = DatabaseData[typeof ObjectStoreName.TEMPLATE][number];
export type Image = DatabaseData[typeof ObjectStoreName.IMAGE][number];
