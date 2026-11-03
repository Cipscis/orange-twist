import { h, type JSX } from 'preact';

import { DragList } from 'components/shared';
import { Template } from './Template';

interface TemplatesListProps {
	templateIds: readonly number[];
	setTemplateIdOrder?: (data: readonly number[]) => Promise<void>;
}

export function TemplatesListSync(props: TemplatesListProps): JSX.Element {
	const {
		templateIds,
		setTemplateIdOrder,
	} = props;

	return <DragList
		onReorder={setTemplateIdOrder}
	>
		{templateIds.map((id) => (
			<Template
				key={id}
				data-drag-list-key={id}
				id={id}
			/>
		))}
	</DragList>;
}
