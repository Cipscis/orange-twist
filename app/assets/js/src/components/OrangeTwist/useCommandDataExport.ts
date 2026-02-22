import { useEffect } from 'preact/hooks';

import { exportData } from 'data';

import { Command } from 'types/Command';
import { registerCommand, useCommand } from 'registers/commands';

/**
 * Register the "Export data" command.
 */
export function useCommandDataExport(): void {
	useEffect(() => {
		registerCommand(Command.DATA_EXPORT, { name: 'Export data' });
	}, []);

	useCommand(Command.DATA_EXPORT, exportData);
}
