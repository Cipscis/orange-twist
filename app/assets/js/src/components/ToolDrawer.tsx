// Type-only import to expose symbol within JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import { type OrangeTwist } from './OrangeTwist';

import {
	h,
	type ComponentChildren,
	type JSX,
} from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import {
	classNames,
	useCloseWatcher,
	type EnumTypeOf,
	nodeHasAncestor,
} from 'utils';

export const ToolDrawerPlacement = {
	LEFT: 'left',
	RIGHT: 'right',
} as const;
export type ToolDrawerPlacement = EnumTypeOf<typeof ToolDrawerPlacement>;

interface ToolDrawerProps {
	side: 'left' | 'right';

	children?: ComponentChildren;
}

/**
 * A tool drawer that should sit in a gutter column of an {@linkcode OrangeTwist} component.
 */
export function ToolDrawer(props: ToolDrawerProps): JSX.Element | null {
	const {
		side,
	} = props;

	/** Component children as an array, even if only one child was passed */
	const children = (() => {
		const { children } = props;
		if (typeof children === 'undefined') {
			return [];
		}

		if (!Array.isArray(children)) {
			return [children];
		}

		// This type assertion is necessary because `Array.isArray` widens the type to `unknown[]`
		// This type assertion is safe because it refers to the type of `props.children`
		return children as Extract<typeof props.children, Array<unknown>>;
	})();

	const rootRef = useRef<HTMLDivElement>(null);

	const [isOpen, setIsOpen] = useState(false);

	const toggleSlideout = useCallback(() => {
		setIsOpen((isOpen) => !isOpen);
	}, []);

	const closeSlideout = useCallback(() => setIsOpen(false), []);

	// Close on UI events like pressing "Escape"
	useCloseWatcher(
		closeSlideout,
		isOpen === true
	);

	// "Light dismiss" behaviour, closing when clicking outside
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		document.addEventListener('click', (e) => {
			if (!(
				e.target instanceof Node &&
				rootRef.current
			)) {
				return;
			}

			if (!nodeHasAncestor(e.target, rootRef.current)) {
				closeSlideout();
			}
		}, { signal });

		return () => controller.abort();
	}, [isOpen, closeSlideout]);

	if (children.length === 0) {
		return null;
	}

	return <div
		class={classNames('tool-drawer', {
			'tool-drawer--left': side === ToolDrawerPlacement.LEFT,
			'tool-drawer--right': side === ToolDrawerPlacement.RIGHT,
			'tool-drawer--open': isOpen,
		})}
		ref={rootRef}
	>
		<button
			onClick={toggleSlideout}
			class="tool-drawer__toggle"
			title="Open tool drawer"
		/>

		<ul class="tool-drawer__items">
			{children.map((child, i) => (
				<li key={i}>
					{child}
				</li>
			))}
		</ul>
	</div>;
}
