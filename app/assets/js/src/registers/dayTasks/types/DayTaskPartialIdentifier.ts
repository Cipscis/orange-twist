import type { ExpandType } from 'util/index';
import type { DayTaskIdentifier } from './DayTaskIdentifier';

/**
 * A partial version of {@linkcode DayTaskIdentifier}, which
 * may match against multiple day tasks.
 */
export type DayTaskPartialIdentifier = ExpandType<Omit<DayTaskIdentifier, 'dayName'> | Omit<DayTaskIdentifier, 'taskId'>>;
