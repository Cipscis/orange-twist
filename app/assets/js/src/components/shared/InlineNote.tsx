import { h, type JSX } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { classNames, useBlurCallback } from 'util/index';
import { Markdown } from './Markdown';
import { IconButton } from './IconButton';

interface InlineNoteProps {
	note: string | null;
	onNoteChange: (note: string | null) => void;
	saveChanges: () => void;

	placeholder?: string;
	editButtonTitle?: string;

	class?: string;
}

export function InlineNote(props: InlineNoteProps): JSX.Element {
	const {
		note,
		onNoteChange,
		saveChanges,
	} = props;

	const previousName = useRef<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [isEditing, setIsEditing] = useState(false);
	const dirtyFlag = useRef(false);

	/**
	 * Save changes if there were any, then clear `dirtyFlag`.
	 */
	const saveChangesIfDirty = useCallback(() => {
		if (dirtyFlag.current) {
			saveChanges();
			dirtyFlag.current = false;
		}
	}, [saveChanges]);

	/**
	 * Update the note and, if there were changes, set the dirty flag.
	 */
	const updateNote = useCallback((newNote: string) => {
		onNoteChange(newNote);
		if (!dirtyFlag.current && newNote !== note) {
			dirtyFlag.current = true;
		}
	}, [note, onNoteChange]);

	/** Enter edit mode. */
	const enterEditMode = useCallback(() => {
		setIsEditing(true);
	}, []);

	/**
	 * Enter edit mode when clicking the name, *unless* a link was clicked.
	 */
	const enterEditModeOnNameClick = useCallback((e: Event) => {
		const { target } = e;

		if (
			target instanceof HTMLAnchorElement ||
			target instanceof Element && target.matches('a *')
		) {
			// If we clicked within a link, don't enter edit mode
			return;
		}

		e.preventDefault();
		enterEditMode();
	}, [enterEditMode]);

	/**
	 * Enter edit mode when clicking the edit button.
	 */
	const enterEditModeOnButtonClick = useCallback((e: Event) => {
		e.preventDefault();
		enterEditMode();
	}, [enterEditMode]);

	// Combine a state variable and `useEffect` to blur the input after re-render
	const [blurOnRenderCount, setBlurOnRenderCount] = useState(0);
	useEffect(() => {
		inputRef.current?.blur();
	}, [blurOnRenderCount]);

	/**
	 * Blur the input after the component re-renders.
	 */
	const blurOnNextRender = useCallback(() => {
		setBlurOnRenderCount((val) => val + 1);
	}, []);

	/**
	 * Clean the note, save any change, and leave edit mode.
	 */
	const leaveEditMode = useCallback(() => {
		onNoteChange(note?.trim() ?? null);
		saveChangesIfDirty();
		setIsEditing(false);
	}, [
		onNoteChange,
		note,
		saveChangesIfDirty,
	]);

	// Remember the previous name when the input is focused.
	const rememberPreviousName = useCallback((e: FocusEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		previousName.current = input.value;
	}, []);

	// Blur on "Enter" or "Escape", either committing or discarding changes
	const keydownHandler = useCallback((e: KeyboardEvent) => {
		const input = e.target;
		if (!(input instanceof HTMLInputElement)) {
			return;
		}

		if (e.key === 'Enter') {
			input.blur();
			return;
		}

		if (e.key === 'Escape') {
			const name = previousName.current ?? '';
			updateNote(name);
			blurOnNextRender();
			return;
		}
	}, [updateNote, blurOnNextRender]);

	// Prevent space from triggering a click event on certain types of parent element, e.g. `<summary>`
	const keyupHandler = useCallback((e: KeyboardEvent) => {
		if (e.key === ' ') {
			e.preventDefault();
		}
	}, []);

	// Automatically focus on input when entering edit mode
	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus();
		}
	}, [isEditing]);

	// Leave edit mode on blur, but not when the tab loses focus
	useBlurCallback(
		inputRef,
		leaveEditMode,
		isEditing,
	);

	// Prompt the user about losing unsaved changes if the tab is closed in edit mode
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		if (isEditing) {
			window.addEventListener(
				'beforeunload',
				(e) => {
					if (dirtyFlag.current) {
						e.preventDefault();
					}
				},
				{ signal }
			);
		}

		return () => controller.abort();
	}, [isEditing]);

	return <form
		class={classNames('inline-note', props.class)}
	>
		{
			isEditing &&
			<input
				ref={inputRef}
				type="text"
				class="inline-note__input"
				value={note ?? ''}
				placeholder={props.placeholder ?? 'Note'}
				size={1}
				onFocus={rememberPreviousName}
				onInput={(e) => updateNote(e.currentTarget.value)}
				onKeyDown={keydownHandler}
				onKeyUp={keyupHandler}
			/>
		}

		{
			note &&
			<Markdown
				content={note?.replace(/</g, '&lt;')}
				class={classNames('inline-note__display', {
					'inline-note__display--hidden': isEditing,
				})}
				onClick={enterEditModeOnNameClick}
				data-testid="inline-note__note"
			/>
		}

		<IconButton
			class="inline-note__edit"
			title={props.editButtonTitle ?? 'Edit note'}
			icon="✏️"
			onClick={enterEditModeOnButtonClick}
		/>
	</form>;
}
