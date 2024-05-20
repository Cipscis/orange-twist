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
		// Open when passed a new resolve callback
		setIsOpen(true);
	}, [resolve]);

	return <Modal
		open={isOpen}
		onClose={cancel}
		class="modal-confirm"
	>
		{message}

		<div class="modal-confirm__actions">
			<Button
				variant={ButtonVariant.SECONDARY}
				onClick={cancel}
			>Cancel</Button>
			<Button
				variant={ButtonVariant.SECONDARY}
				onClick={confirm}
			>Confirm</Button>
		</div>
	</Modal>;
}
