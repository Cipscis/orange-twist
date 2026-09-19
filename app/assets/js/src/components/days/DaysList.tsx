import type Preact from 'preact';
import {
	h,
	type JSX,
} from 'preact';
import { useCallback, useState } from 'preact/hooks';

import { getDayName, type Day } from 'database';
import type { DefaultsFor } from 'utils';

import { Accordion, AccordionScrollBehaviour } from 'components/shared';
import { Day as DayDetail } from './Day';

export interface DaysListProps {
	days: readonly Day[];
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
	Omit<DaysListProps, 'selectedDayId' | 'class'>
>;

/**
 * Renders a list of days.
 */
export function DaysList(props: DaysListProps): JSX.Element {
	const {
		days,
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
			days.map(((day) => (
				<DayDetail
					key={day.id}
					dayName={getDayName(day)}
					open={selectedDayId === day.id}
				/>
			)))
		}
	</Accordion>;
}
