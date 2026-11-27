import { AsyncActionStateType, LiveData } from 'utils/asyncAction';

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
		super(
			async function getData(_options) {
				const template = await loadTemplateByAlias(templateAlias);

				if (template === null) {
					throw new Error(`Could not find template with alias ${templateAlias}`);
				}

				return template;
			},
			{
				observeState(getDataArg, state, signal) {
					const getData = () => getDataArg();

					if (state.type === AsyncActionStateType.ERROR) {
						addChangeListener(
							ChangeType.ADD,
							{ type: ChangeEntityType.TEMPLATE },
							getData,
							{ signal },
						);
					} else if (state.type === AsyncActionStateType.SUCCESS) {
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
			}
		);
	}
}
