import { h, type JSX } from 'preact';

import { classNames } from 'util/index';

interface LoaderProps {
	immediate?: boolean;
}

export function Loader(props: LoaderProps): JSX.Element {
	return <div class={classNames('loader', {
		'loader--immediate': props.immediate,
	})}
	/>;
}
