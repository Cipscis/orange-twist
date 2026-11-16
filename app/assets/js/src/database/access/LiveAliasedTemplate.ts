import { AsyncDataStateType, LiveData } from 'utils/asyncData';

import type { Template } from '../types';
import {
	addChangeListener,
	ChangeEntityType,
	ChangeType,
} from './liveAccessManager';

import { loadTemplateByAlias } from './loadTemplateByAlias';

/**
 * Provides live access to a template, specified by its alias.
 */
export class LiveAliasedTemplate extends LiveData<Template> {
	constructor(templateAlias: string) {
		super({
			async getData(_options) {
				const template = await loadTemplateByAlias(templateAlias);

				if (template === null) {
					throw new Error(`Could not find template with alias ${templateAlias}`);
				}

				return template;
			},
			observeState(getDataArg, state, signal) {
				// Task listeners
				const getData = () => getDataArg();

				if (state.type === AsyncDataStateType.ERROR) {
					addChangeListener(
						ChangeType.ADD,
						{ type: ChangeEntityType.TEMPLATE },
						getData,
						{ signal },
					);
				} else if (state.type === AsyncDataStateType.SUCCESS) {
					const changeEntity = {
						type: ChangeEntityType.TEMPLATE,
						id: state.data.id,
					};

					addChangeListener(
						ChangeType.CHANGE,
						changeEntity,
						getData,
						{ signal },
					);

					addChangeListener(
						ChangeType.DELETE,
						changeEntity,
						getData,
						{ signal },
					);
				}
			},
		});
	}
}
