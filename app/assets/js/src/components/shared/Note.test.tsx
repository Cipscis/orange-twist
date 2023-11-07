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

import { Note } from './Note';

beforeAll(() => {
	// jsdom hasn't implemented window.scrollTo, so mock it to hide console errors
	window.scrollTo = jest.fn();
});

describe('Note', () => {
	afterEach(() => {
		cleanup();
	});

	test('renders edit button if no note', () => {
		const {
			queryByTitle,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = queryByTitle('Edit note');
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

	test('enters edit mode when edit button is clicked', async () => {
		const user = userEvent.setup();

		const note = 'Test note';

		const {
			queryByRole,
			queryByTitle,
		} = render(
			<Note
				note={note}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = queryByTitle('Edit note')!;
		await user.click(editButton);

		const textarea = queryByRole('textbox') as HTMLTextAreaElement;

		expect(textarea).toBeInTheDocument();
		expect(textarea.value).toBe(note);
	});

	test('enters edit mode when note is clicked', async () => {
		const user = userEvent.setup();

		const note = 'Test note';

		const {
			queryByRole,
			queryByText,
		} = render(
			<Note
				note={note}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const noteContent = queryByText(note);
		await user.click(noteContent!);

		const textarea = queryByRole('textbox') as HTMLTextAreaElement;

		expect(textarea).toBeInTheDocument();
		expect(textarea.value).toBe(note);
	});

	test('does not enter edit mode when a link in the note is clicked', async () => {
		const user = userEvent.setup();

		// Use a hash link so jsdom won't complain about being unable to navigate
		const noteWithLink = 'This note has [a link](#)';

		const {
			queryByRole,
			queryByTitle,
		} = render(
			<Note
				note={noteWithLink}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const linkInContent = queryByRole('link')!;
		expect(linkInContent).toBeInTheDocument();
		await user.click(linkInContent);

		expect(queryByRole('textbox')).not.toBeInTheDocument();

		const editButton = queryByTitle('Edit note')!;
		await user.click(editButton);

		const textarea = queryByRole('textbox') as HTMLTextAreaElement;

		expect(textarea).toBeInTheDocument();
		expect(textarea.value).toBe(noteWithLink);
	});

	test('calls onNoteChange when the note is changed', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const {
			queryByRole,
			queryByTitle,
		} = render(
			<Note
				note={null}
				onNoteChange={spy}
				saveChanges={() => {}}
			/>
		);

		const editButton = queryByTitle('Edit note')!;
		await user.click(editButton);

		const textarea = queryByRole('textbox') as HTMLTextAreaElement;
		await user.type(textarea, 'abcd');

		expect(spy).toHaveBeenCalledWith('a');
		expect(spy).toHaveBeenCalledWith('ab');
		expect(spy).toHaveBeenCalledWith('abc');
		expect(spy).toHaveBeenCalledWith('abcd');
	});

	test('leaves editing mode when pressing "Escape"', async () => {
		const user = userEvent.setup();

		const {
			queryByRole,
			queryByTitle,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = queryByTitle('Edit note')!;
		await user.click(editButton);

		expect(queryByRole('textbox')).toBeInTheDocument();

		await user.keyboard('{Escape}');

		expect(queryByRole('textbox')).not.toBeInTheDocument();
	});

	test('leaves editing mode when pressing "Ctrl + Enter"', async () => {
		const user = userEvent.setup();

		const {
			queryByRole,
			queryByTitle,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = queryByTitle('Edit note')!;
		await user.click(editButton);

		expect(queryByRole('textbox')).toBeInTheDocument();

		// Pressing enter should not exit edit mode
		await user.keyboard('{Enter}');

		expect(queryByRole('textbox')).toBeInTheDocument();

		await user.keyboard('{Control>}{Enter}{/Control}');

		expect(queryByRole('textbox')).not.toBeInTheDocument();
	});

	test('leaves editing mode when keyboard focus moves elsewhere', async () => {
		const user = userEvent.setup();

		const {
			queryByRole,
			queryByTitle,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = queryByTitle('Edit note')!;
		await user.click(editButton);

		expect(queryByRole('textbox')).toBeInTheDocument();

		await user.click(document.body);

		expect(queryByRole('textbox')).not.toBeInTheDocument();
	});

	test('inserts a Tab character when pressing the Tab key', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const {
			queryByRole,
			queryByTitle,
		} = render(
			<Note
				note={null}
				onNoteChange={spy}
				saveChanges={() => {}}
			/>
		);

		const editButton = queryByTitle('Edit note')!;
		await user.click(editButton);
		const textarea = queryByRole('textbox');

		expect(textarea).toHaveFocus();

		// An extra character is needed because the note is "cleaned" each time
		await user.keyboard('{Tab}b');

		expect(spy).toHaveBeenCalledWith('\tb');
		expect(textarea).toHaveFocus();
	});

	test('calls saveChanges when leaving editing mode, if the note was changed', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const {
			queryByRole,
			queryByTitle,
		} = render(
			<Note
				note={null}
				onNoteChange={() => {}}
				saveChanges={spy}
			/>
		);

		const editButton = queryByTitle('Edit note')!;
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

		const { getByRole, getByTitle } = render(<NoteContainer />);

		const editButton = getByTitle('Edit note')!;
		await user.click(editButton);

		const textarea = getByRole('textbox') as HTMLTextAreaElement;
		await user.type(textarea, 'ab{ArrowLeft}{ArrowLeft}cd');

		expect(spy).toHaveBeenCalledWith('a');
		expect(spy).toHaveBeenCalledWith('ab');
		expect(spy).toHaveBeenCalledWith('cab');
		expect(spy).toHaveBeenCalledWith('cdab');
	});
});
