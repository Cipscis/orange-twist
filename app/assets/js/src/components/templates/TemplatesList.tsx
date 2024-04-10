import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { setTemplateInfo, type TemplateInfo } from 'data';

import { DragList } from 'components/shared';
import { Template } from './Template';

interface TemplatesListProps {
	templates: TemplateInfo[];
}

export function TemplatesList(props: TemplatesListProps): JSX.Element {
	const { templates } = props;

	const updateTemplateOrder = useCallback(
		(templateIds: readonly number[]) => {
			templateIds.forEach((id, i) => {
				setTemplateInfo(id, { sortIndex: i });
			});
		},
		[]
	);

	return <DragList onReorder={updateTemplateOrder}>
		{templates.map(({ id }) => (
			<Template
				key={id}
				data-drag-list-key={id}
				id={id}
			/>
		))}
	</DragList>;
}
