import type { CommandsList } from './CommandsList';

/**
 * A union containing the string ID of every defined Command.
 */
export type CommandId = keyof CommandsList;
