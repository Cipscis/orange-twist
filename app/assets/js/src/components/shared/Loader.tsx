import { h, type JSX } from 'preact';

import { classNames } from 'utils';

interface LoaderProps {
	immediate?: boolean;
	class?: string;
}

export function Loader(props: LoaderProps): JSX.Element {
	return <div
		class={classNames('loader', props.class, {
			'loader--immediate': props.immediate,
		})}
		data-testid="loader"
	/>;
}
