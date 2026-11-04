import { AsyncDataStateType, SettableLiveData } from 'utils/asyncData';
import { sortBySortIndex } from 'utils/sortBySortIndex';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';
import { SaveType } from './SaveAction';

import { loadAllTemplates } from './loadAllTemplates';

/**
 * Provides live access to a reorderable list of all template's IDs.
 */
export class SettableAllTemplateIds extends SettableLiveData<readonly number[]> {
	constructor() {
		super({
			optimistic: true,
			async getData(_options) {
				const templates = await loadAllTemplates();

				return sortBySortIndex(templates).map(({ id }) => id);
			},
			async setData(templateIds, _signal) {
				await fireCommand(Command.DATA_SAVE, templateIds.map((id, sortIndex) => ({
					type: SaveType.TEMPLATE,
					id,
					template: { sortIndex },
				})));
			},
			observe(getData, signal) {
				addChangeListener(
					ChangeType.ADD,
					{ type: ChangeEntityType.TEMPLATE },
					() => getData(),
					{ signal },
				);
			},
			observeState(getData, state, signal) {
				if (state.type === AsyncDataStateType.SUCCESS) {
					for (const id of state.data) {
						// TODO: Limit refreshes to when the template's sortIndex was updated
						addChangeListener(
							ChangeType.CHANGE,
							{ type: ChangeEntityType.TEMPLATE, id },
							() => getData(),
							{ signal },
						);

						addChangeListener(
							ChangeType.DELETE,
							{ type: ChangeEntityType.TEMPLATE, id },
							() => getData(),
							{ signal },
						);
					}
				}
			},
		});
	}
}
