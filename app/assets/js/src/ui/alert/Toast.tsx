import { h, type JSX } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';

import { animate, CSSKeyframes } from 'util/index';
import { removeToast, renderToasts } from './toast-controller';

export interface ToastProps {
	/**
	 * Automatically generated IDs are numbers, specified IDs are strings.
	 */
	id: number | string;
	message: string | JSX.Element;
	/**
	 * The duration, in milliseconds, that a toast should stay on-screen.
	 * If the toast is ever re-rendered, the duration will be restarted.
	 *
	 * A `null` duration means the toast is persistent.
	 */
	duration: number | null;
}

/**
 * Renders a toast, which may automatically hide itself after a delay.
 */
export function Toast(props: ToastProps): JSX.Element {
	const {
		id,
		message,
		duration,
	} = props;

	const toastRef = useRef<HTMLDivElement>(null);
	const progressRef = useRef<HTMLSpanElement>(null);

	const progressAnimationRef = useRef<Animation | null>(null);

	// After the initial render, start the animation
	useEffect(() => {
		if (
			duration &&
			progressRef.current &&
			!progressAnimationRef.current
		) {
			progressAnimationRef.current = progressRef.current.animate([
				{ width: 0 },
				{ width: '100%' },
			], { duration });

			progressAnimationRef.current.finished.then(async () => {
				if (toastRef.current) {
					// TODO: If a toast with the same ID is updated while it's animating out, it won't re-show
					const animation = animate(toastRef.current, CSSKeyframes.DISAPPEAR_UP);
					await animation.finished;
				}

				removeToast(id);
				renderToasts();
			});
		}
	}, [duration, id]);

	/**
	 * A set of reasons why the animation may need to be paused.
	 */
	const pauseReasons = useRef<{
		hover: boolean;
		focus: boolean;
	}>({
		hover: false,
		focus: false,
	});

	/**
	 * Determines if the animation can be unpaused.
	 */
	const canPlay = useCallback(() => {
		// Can only play if every reason is false
		return Object.entries(pauseReasons.current).every(([reason, state]) => state === false);
	}, []);

	// Pause the animation on hover or focus
	useEffect(() => {
		const toastEl = toastRef.current;
		if (!toastEl) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		toastEl.addEventListener('mouseenter', () => {
			pauseReasons.current.hover = true;
			progressAnimationRef.current?.pause();
		}, { signal });
		toastEl.addEventListener('mouseleave', () => {
			pauseReasons.current.hover = false;
			if (canPlay()) {
				progressAnimationRef.current?.play();
			}
		}, { signal });

		toastEl.addEventListener('focus', () => {
			pauseReasons.current.focus = true;
			progressAnimationRef.current?.pause();
		}, { signal });
		toastEl.addEventListener('blur', () => {
			pauseReasons.current.focus = false;
			if (canPlay()) {
				progressAnimationRef.current?.play();
			}
		}, { signal });

		return () => controller.abort();
	}, [canPlay]);

	return <div
		ref={toastRef}
		class="toast"
		tabindex={0}
	>
		{
			duration &&
			<span
				ref={progressRef}
				class="toast__progress"
			/>
		}
		<span class="toast__message">{message}</span>
	</div>;
}
