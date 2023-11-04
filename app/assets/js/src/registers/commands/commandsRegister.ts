import { Register } from 'util/register/Register';

import type { CommandId } from './types/CommandId';
import type { CommandRegistration } from './types/CommandRegistration';

export const commandsRegister = new Register<CommandId, CommandRegistration>();
