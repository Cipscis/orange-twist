import { Register } from 'util/register/Register';

import type { CommandId } from './types/CommandId';
import type { CommandRegistration } from './types/CommandRegistration';

/**
 * The {@linkcode Register} containing registration information for all
 * registered commands.
 */
export const commandsRegister = new Register<CommandId, CommandRegistration>();
