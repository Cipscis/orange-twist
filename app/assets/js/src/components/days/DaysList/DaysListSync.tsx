import type Preact from 'preact';
import {
	h,
	type JSX,
} from 'preact';
import { useCallback, useState } from 'preact/hooks';

import type { DefaultsFor } from 'utils';

import { Accordion, AccordionScrollBehaviour } from 'components/shared';
import { Day } from '../Day';

export interface DaysListSyncProps {
	dayIds: readonly number[];
	title: string;
	selectedDayId?: number;
	class?: string;
	open?: boolean;
	scrollBehaviour?: AccordionScrollBehaviour;
}

const defaultProps = {
	open: false,
	scrollBehaviour: AccordionScrollBehaviour.AUTO,
} as const satisfies DefaultsFor<
	Omit<DaysListSyncProps, 'selectedDayId' | 'class'>
>;

/**
 * Renders a list of days in an accordion.
 */
export function DaysListSync(props: DaysListSyncProps): JSX.Element {
	const {
		dayIds,
		title,
		selectedDayId,
		class: className,

		open: openByDefault,
		scrollBehaviour,
	} = {
		...defaultProps,
		...props,
	};

	const [open, setOpen] = useState(openByDefault);
	const onToggle = useCallback(
		(event: Preact.TargetedEvent<HTMLDetailsElement, Event>) => {
			setOpen(event.currentTarget.open);
		},
		[]
	);

	return <Accordion
		class={className}
		summary={
			<h2 class="orange-twist__title">{title}</h2>
		}
		open={open}
		onToggle={onToggle}
		scrollBehaviour={scrollBehaviour}
	>
		{open &&
			dayIds.map(((dayId) => (
				<Day
					key={dayId}
					day={dayId}
					open={selectedDayId === dayId}
				/>
			)))
		}
	</Accordion>;
}
