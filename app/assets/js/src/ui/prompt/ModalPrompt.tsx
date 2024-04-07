import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import {
	Button,
	ButtonVariant,
	Modal,
} from 'components/shared';

interface ModalPromptProps {
	message: string;
	placeholder?: string;
	/** @default 'text' */
	type?: string;
	resolve: (result: string | null) => void;
}

/**
 * A prompt that asks the user to enter a string. The `resolve` prop
 * will be called when the prompt is closed, either with the string
 * entered by the user or `null` if the prompt was cancelled.
 */
export function ModalPrompt(props: ModalPromptProps): JSX.Element {
	const {
		message,
		placeholder,
		type,
		resolve,
	} = props;

	const [isOpen, setIsOpen] = useState(true);

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

	return <Modal
		open={isOpen}
		onClose={useCallback(() => {
			setIsOpen(false);
			resolve(null);
		}, [resolve])}
		closeButton
	>
		<form
			onSubmit={useCallback<
				NonNullable<JSX.DOMAttributes<HTMLFormElement>['onSubmit']>
			>((e) => {
				e.preventDefault();

				const form = e.currentTarget;
				const formData = new FormData(form);

				const result = formData.get('result');
				if (typeof result === 'string') {
					resolve(result);
				} else {
					resolve(null);
				}

				setIsOpen(false);
			}, [resolve])}
			class="modal-prompt__form"
		>
			<label>
				<div class="modal-prompt__message">{message}</div>
				<input
					type={type ?? 'text'}
					name="result"
					class="modal-prompt__input"
					placeholder={placeholder}
					autofocus
				/>
			</label>

			<Button variant={ButtonVariant.SECONDARY} type="submit">Okay</Button>
		</form>
	</Modal>;
}
