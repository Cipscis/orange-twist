import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { Modal } from 'components/shared/Modal';

interface ModalPromptProps {
	message: string;
	resolve: (result: string | null) => void;
}

export function ModalPrompt(props: ModalPromptProps): JSX.Element {
	const {
		message,
		resolve,
	} = props;

	const [isOpen, setIsOpen] = useState(true);
	const resultElRef = useRef<HTMLInputElement>(null);

	const previousResolver = useRef<
	((result: string | null) => void) | null
		>(null);

	// Whenever the resolve function is changed, call the
	// previous resolve function and re-open the modal
	useEffect(() => {
		if (previousResolver.current) {
			previousResolver.current(null);
		}

		previousResolver.current = resolve;
		setIsOpen(true);
	}, [resolve]);

	// Focus on input immediately when opened
	useEffect(() => {
		if (isOpen) {
			resultElRef.current?.focus();
		}
	}, [isOpen]);

	return <Modal
		open={isOpen}
		onClose={useCallback(() => {
			setIsOpen(false);
			resolve(null);
		}, [resolve])}
	>
		<form
			onSubmit={useCallback((e: Event) => {
				e.preventDefault();

				const result = resultElRef.current?.value ?? null;
				if (!result) {
					resolve(null);
				}

				resolve(result);
				setIsOpen(false);
			}, [resolve])}
		>
			<label>
				{message}
				<input
					ref={resultElRef}
					type="text"
					name="result"
				/>
			</label>

			<button type="submit">Okay</button>
		</form>
	</Modal>;
}
