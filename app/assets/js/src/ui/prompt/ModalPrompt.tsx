import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { assertAllUnionMembersHandled } from 'utils';

import {
	Button,
	ButtonVariant,
	Modal,
} from 'components/shared';

import { TaskLookup } from 'components/tasks/TaskLookup';
import { PromptType, type PromptReturnType } from './prompt';

interface ModalPromptProps<T extends PromptType> {
	message: string;
	placeholder?: string;
	type: T;
	resolve: (result: PromptReturnType[T] | null) => void;
}

/**
 * A prompt that asks the user to enter a string. The `resolve` prop
 * will be called when the prompt is closed, either with the string
 * entered by the user or `null` if the prompt was cancelled.
 */
export function ModalPrompt<T extends PromptType>(props: ModalPromptProps<T>): JSX.Element {
	const {
		message,
		placeholder,
		type,
		resolve,
	} = props;

	const [isOpen, setIsOpen] = useState(true);

	const previousResolver = useRef<
		((result: PromptReturnType[T] | null) => void) | null
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

	/**
	 * Retrieve the result from the DOM, and pass it to the `resolve` prop. Then close the modal.
	 */
	const resolveWithResult = useCallback<
		NonNullable<JSX.DOMAttributes<HTMLFormElement>['onSubmit']>
	>((e) => {
		e.preventDefault();

		if (type === PromptType.TEXT || type === PromptType.DATE) {
			const form = e.currentTarget;
			const formData = new FormData(form);

			const result = formData.get('result');
			// This type assertion should be safe, so long as the result input is configured correctly
			resolve(result as PromptReturnType[T] | null);
		} else if (type === PromptType.TASK) {
			// This type assertion is safe, because we've checked `T` via `type`
			resolve(selectedTaskId.current as PromptReturnType[T] | null);
		} else {
			assertAllUnionMembersHandled(type);
		}

		setIsOpen(false);
	}, [type, resolve]);

	const selectedTaskId = useRef<number | null>(null);
	const noteSelectedTaskId = useCallback((taskId: number | null) => selectedTaskId.current = taskId, []);

	return <Modal
		open={isOpen}
		onClose={useCallback(() => {
			setIsOpen(false);
			resolve(null);
		}, [resolve])}
		closeButton
	>
		<form
			onSubmit={resolveWithResult}
			class="modal-prompt__form"
		>
			<label>
				<div class="modal-prompt__message">{message}</div>
				{
					type === PromptType.TEXT ?
						(
							<input
								type="text"
								name="result"
								class="modal-prompt__input"
								placeholder={placeholder}
								autofocus
							/>
						)
						: type === PromptType.DATE ?
							(
								<input
									type="date"
									name="result"
									class="modal-prompt__input"
									placeholder={placeholder}
									autofocus
								/>
							)
							: type === PromptType.TASK ?
								(
									<TaskLookup
										onSelect={noteSelectedTaskId}
									/>
								)
								: assertAllUnionMembersHandled(type)
				}
			</label>

			<Button variant={ButtonVariant.SECONDARY} type="submit">Okay</Button>
		</form>
	</Modal>;
}
