import {
	h,
	Fragment,
	type JSX,
	type TargetedEvent,
} from 'preact';
import {
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from 'preact/hooks';

import { assertAllUnionMembersHandled, strMatch } from 'utils';
import type { TaskInfo } from 'data';

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
	const idForLabel = useId();

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

	const taskFilterQueryElRef = useRef<HTMLInputElement>(null);
	const [taskFilterQuery, setTaskFilterQuery] = useState<string | null>(taskFilterQueryElRef.current?.value || null);

	// Ensure the filter query is cleared when the modal is closed
	useEffect(() => {
		if (isOpen) {
			return;
		}

		setTaskFilterQuery(null);
	}, [isOpen]);

	/**
	 * Update the filter applied to task names when the input changes.
	 */
	const updateTaskFilterQuery = useCallback((e: TargetedEvent<HTMLInputElement>) => {
		setTaskFilterQuery(e.currentTarget.value || null);
	}, []);

	/**
	 * Filter tasks based on whether or not their name contains the query.
	 */
	const applyTaskFilter = useCallback<(taskInfo: TaskInfo) => boolean>((taskInfo) => {
		if (taskFilterQuery === null) {
			return true;
		}

		// TODO: Upgrade this into a fuzzy search filter
		return strMatch(taskInfo.name, taskFilterQuery, {
			ignoreCase: true,
			ignoreDiacritics: true,
		});
	}, [taskFilterQuery]);

	const exactMatch = useCallback((taskInfo: TaskInfo) => {
		if (taskFilterQuery === null) {
			return false;
		}

		return strMatch(taskInfo.name, taskFilterQuery, {
			ignoreCase: true,
			ignoreDiacritics: true,
			allowPartial: false,
		});
	}, [taskFilterQuery]);

	const selectedTaskId = useRef<number | null>(null);
	/** Remember the selected task in a ref to pass up when the value is confirmed. */
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
			{
				type === PromptType.TEXT ?
					(
						<label>
							<div class="modal-prompt__message">{message}</div>
							<input
								type="text"
								name="result"
								class="modal-prompt__input"
								placeholder={placeholder}
								autofocus
							/>
						</label>
					)
					: type === PromptType.DATE ?
						(
							<label>
								<div class="modal-prompt__message">{message}</div>
								<input
									type="date"
									name="result"
									class="modal-prompt__input"
									placeholder={placeholder}
									autofocus
								/>
							</label>
						)
						: type === PromptType.TASK ?
							(
								<>
									<label class="modal-prompt__message" for={idForLabel}>{message}</label>
									<input
										type="text"
										class="modal-prompt__input"
										placeholder="Filter tasks"
										ref={taskFilterQueryElRef}
										onInput={updateTaskFilterQuery}
										autofocus
									/>
									<TaskLookup
										onSelect={noteSelectedTaskId}
										filter={applyTaskFilter}
										exactMatch={exactMatch}
										class="modal-prompt__input"
										id={idForLabel}
										required
									/>
								</>
							)
							: assertAllUnionMembersHandled(type)
			}

			<Button variant={ButtonVariant.SECONDARY} type="submit">Okay</Button>
		</form>
	</Modal>;
}
