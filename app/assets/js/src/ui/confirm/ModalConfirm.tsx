import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { Modal } from 'components/shared/Modal';

interface ModalConfirmProps {
	message: string;
	resolve: (result: boolean) => void;
}

export function ModalConfirm(props: ModalConfirmProps): JSX.Element {
	const {
		message,
		resolve,
	} = props;

	const [isOpen, setIsOpen] = useState(true);

	const confirm = useCallback(() => {
		setIsOpen(false);
		resolve(true);
	}, [resolve]);

	const cancel = useCallback(() => {
		setIsOpen(false);
		resolve(false);
	}, [resolve]);

	const previousResolver = useRef<
	((result: boolean) => void) | null
		>(null);

	// Whenever the resolve function is changed, call the
	// previous resolve function and re-open the modal
	useEffect(() => {
		if (previousResolver.current) {
			previousResolver.current(false);
		}

		previousResolver.current = resolve;
		setIsOpen(true);
	}, [resolve]);

	// Open when passed a new resolve callback
	useEffect(() => {
		setIsOpen(true);
	}, [resolve]);



	return <Modal
		open={isOpen}
		onClose={cancel}
		class="modal-confirm"
	>
		{message}

		<div class="modal-confirm__actions">
			<button
				type="button"
				class="modal-confirm__button"
				onClick={cancel}
			>Cancel</button>
			<button
				type="button"
				class="modal-confirm__button"
				onClick={confirm}
			>Confirm</button>
		</div>
	</Modal>;
}
