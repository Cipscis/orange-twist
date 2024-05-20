import { h } from 'preact';
import { useState } from 'preact/hooks';

import {
	afterEach,
	beforeAll,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import {
	render,
	cleanup,
} from '@testing-library/preact';

import userEvent from '@testing-library/user-event';

import { KeyboardShortcutName, registerKeyboardShortcut } from 'registers/keyboard-shortcuts';

import { Note } from './Note';

describe('Note', () => {
	beforeAll(() => {
		registerKeyboardShortcut(
			KeyboardShortcutName.EDITING_FINISH,
			[
				{ key: 'Enter', ctrl: true },
				{ key: 'Escape' },
			]
		);
	});

	afterEach(() => {
		cleanup();
	});

	test('renders edit button if no note', () => {
		const {
			getByRole,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		expect(editButton).toBeInTheDocument();
	});

	test('renders note content', () => {
		const note = 'Note content';

		const {
			queryByText,
		} = render(
			<Note
				note={note}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		expect(queryByText(note)).toBeInTheDocument();
	});

	test('renders any specified CSS classes', () => {
		render(<Note
			note={'Test note'}
			onNoteChange={() => {}}
			saveChanges={() => {}}

			class="test-class"
		/>);

		expect(document.querySelector('.test-class')).toBeInTheDocument();
	});

	test('enters edit mode when edit button is clicked', async () => {
		const user = userEvent.setup();

		const note = 'Test note';

		const {
			getByRole,
		} = render(
			<Note
				note={note}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		const textarea = getByRole('textbox') as HTMLTextAreaElement;

		expect(textarea).toBeInTheDocument();
		expect(textarea.value).toBe(note);
	});

	test('enters edit mode when note is clicked', async () => {
		const user = userEvent.setup();

		const note = 'Test note';

		const {
			queryByRole,
			getByText,
		} = render(
			<Note
				note={note}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const noteContent = getByText(note);
		await user.click(noteContent);

		const textarea = queryByRole('textbox') as HTMLTextAreaElement;

		expect(textarea).toBeInTheDocument();
		expect(textarea.value).toBe(note);
	});

	test('does not enter edit mode when a link in the note is clicked', async () => {
		const user = userEvent.setup();

		// Use a hash link so jsdom won't complain about being unable to navigate
		const noteWithLink = 'This note has [a link](#)';

		const {
			getByRole,
			queryByRole,
		} = render(
			<Note
				note={noteWithLink}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const linkInContent = getByRole('link');
		expect(linkInContent).toBeInTheDocument();
		await user.click(linkInContent);

		expect(queryByRole('textbox')).not.toBeInTheDocument();

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		const textarea = getByRole('textbox') as HTMLTextAreaElement;

		expect(textarea).toBeInTheDocument();
		expect(textarea.value).toBe(noteWithLink);
	});

	test('calls onNoteChange when the note is changed', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const {
			getByRole,
		} = render(
			<Note
				note={null}
				onNoteChange={spy}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		const textarea = getByRole('textbox') as HTMLTextAreaElement;
		await user.type(textarea, 'abcd');
		expect(spy).toHaveBeenCalledTimes(0);

		// Click outside to blur element and cause change event
		await user.click(document.body);
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith('abcd');
	});

	test('leaves editing mode when pressing the "Finish editing" keyboard shortcut', async () => {
		const user = userEvent.setup();

		const {
			getByRole,
			queryByRole,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);
		expect(queryByRole('textbox')).toBeInTheDocument();

		// Pressing enter should not exit edit mode
		await user.keyboard('{Enter}');
		expect(queryByRole('textbox')).toBeInTheDocument();

		// Pressing Ctrl + enter should exit edit mode
		await user.keyboard('{Control>}{Enter}{/Control}');
		expect(queryByRole('textbox')).not.toBeInTheDocument();

		// Pressing escape should exit edit mode
		await user.click(editButton);
		expect(queryByRole('textbox')).toBeInTheDocument();
		await user.keyboard('{Escape}');
		expect(queryByRole('textbox')).not.toBeInTheDocument();
	});

	test('leaves editing mode when keyboard focus moves elsewhere', async () => {
		const user = userEvent.setup();

		const {
			getByRole,
			queryByRole,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		expect(queryByRole('textbox')).toBeInTheDocument();

		await user.click(document.body);

		expect(queryByRole('textbox')).not.toBeInTheDocument();
	});

	test('inserts a Tab character when pressing the Tab key', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const {
			getByRole,
		} = render(
			<Note
				note={null}
				onNoteChange={spy}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);
		const textarea = getByRole('textbox');

		expect(textarea).toHaveFocus();

		// Extra characters are needed because the note is trimmed
		await user.keyboard('a{Tab}b');
		expect(textarea).toHaveFocus();
		await user.click(document.body);
		expect(spy).toHaveBeenCalledWith('a\tb');
	});

	test('calls saveChanges when leaving editing mode, if the note was changed', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const {
			getByRole,
			queryByRole,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={spy}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		expect(queryByRole('textbox')).toBeInTheDocument();
		expect(spy).not.toHaveBeenCalled();

		await user.click(document.body);

		// If the note wasn't edited, saveChanges isn't called
		expect(queryByRole('textbox')).not.toBeInTheDocument();
		expect(spy).not.toHaveBeenCalled();

		await user.click(editButton);
		await user.keyboard('edit');
		await user.keyboard('{Control>}{Enter}{/Control}');

		expect(queryByRole('textbox')).not.toBeInTheDocument();
		expect(spy).toHaveBeenCalled();
	});

	test('allows editing the middle when the note is updated on each change', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const NoteContainer = function () {
			const [note, setNote] = useState('');

			return <Note
				note={note}
				onNoteChange={(note: string) => {
					spy(note);
					setNote(note);
				}}
				saveChanges={() => {}}
			/>;
		};

		const { getByRole } = render(<NoteContainer />);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		const textarea = getByRole('textbox') as HTMLTextAreaElement;
		await user.type(textarea, 'ab{ArrowLeft}{ArrowLeft}cd');
		await user.click(document.body);
		expect(spy).toHaveBeenCalledWith('cdab');
	});

	describe('if the tab is unloaded while in editing mode', () => {
		test('if there are unsaved changes, cancels the event', async () => {
			const user = userEvent.setup();

			const note = 'Test note';

			const {
				getByRole,
			} = render(
				<Note
					note={note}
					onNoteChange={() => {}}
					saveChanges={() => {}}
				/>
			);

			const editButton = getByRole('button', { name: 'Edit note' });
			await user.click(editButton);
			await user.keyboard('abcd');

			const event = new Event('beforeunload', { cancelable: true });
			window.dispatchEvent(event);
			expect(event.defaultPrevented).toBe(true);
		});

		test('if there are no unsaved changes, does not cancel the event', async () => {
			const user = userEvent.setup();

			const note = 'Test note';

			const {
				getByRole,
			} = render(
				<Note
					note={note}
					onNoteChange={() => {}}
					saveChanges={() => {}}
				/>
			);

			const editButton = getByRole('button', { name: 'Edit note' });
			await user.click(editButton);

			const event = new Event('beforeunload', { cancelable: true });
			window.dispatchEvent(event);
			expect(event.defaultPrevented).toBe(false);
		});
	});
});
