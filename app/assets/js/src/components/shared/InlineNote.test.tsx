import { h } from 'preact';

import {
	afterEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';

import { cleanup, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { InlineNote } from './InlineNote';

describe('InlineNote', () => {
	afterEach(() => {
		cleanup();
	});

	test('renders the note as markdown', () => {
		const { getByTestId } = render(
			<InlineNote
				note="**Bold** *italic* `code`"
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const content = getByTestId('inline-note__note');
		expect(content).toBeInTheDocument();
		expect(content.innerHTML.trim()).toBe('<p><strong>Bold</strong> <em>italic</em> <code>code</code></p>');
	});

	test('renders any specific CSS classes', () => {
		render(<InlineNote
			note={'Test note'}
			onNoteChange={() => {}}
			saveChanges={() => {}}

			class="test-class"
		/>);

		expect(document.querySelector('.test-class')).toBeInTheDocument();
	});

	test('opens edit mode when the edit button is clicked', async () => {
		const user = userEvent.setup();

		const { getByRole } = render(
			<InlineNote
				note="Task note"
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		const inputEl = getByRole('textbox');
		expect(inputEl).toHaveFocus();
		expect(inputEl).toHaveValue('Task note');
	});

	test('can customise edit button title', () => {
		const { getByRole } = render(
			<InlineNote
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}

				editButtonTitle="Custom edit button title"
			/>
		);

		const editButton = getByRole('button', { name: 'Custom edit button title' });
		expect(editButton).toBeInTheDocument();
	});

	test('can customise placeholder', async () => {
		const user = userEvent.setup();

		const {
			getByPlaceholderText,
			getByRole,
		} = render(
			<InlineNote
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}

				placeholder="Custom placeholder"
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		const input = getByPlaceholderText('Custom placeholder');
		expect(input).toBeInTheDocument();
	});

	test('opens edit mode when the note is clicked', async () => {
		const user = userEvent.setup();

		const { getByRole, getByText } = render(
			<InlineNote
				note="Task note"
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const name = getByText('Task note');
		await user.click(name);

		const inputEl = getByRole('textbox');
		expect(inputEl).toHaveFocus();
		expect(inputEl).toHaveValue('Task note');
	});

	test('does not open edit mode when a link inside the note is clicked', async () => {
		const user = userEvent.setup();

		const { getByRole, queryByRole } = render(
			<InlineNote
				note="[Link text](#)"
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const name = getByRole('link', { name: 'Link text' });
		await user.click(name);

		const inputEl = queryByRole('textbox');
		expect(inputEl).not.toBeInTheDocument();
	});

	test('calls onNoteChange when the note is changed', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const {
			getByRole,
		} = render(
			<InlineNote
				note={null}
				onNoteChange={spy}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);

		const textarea = getByRole('textbox') as HTMLTextAreaElement;
		await user.type(textarea, 'abcd');

		expect(spy).toHaveBeenCalledWith('a');
		expect(spy).toHaveBeenCalledWith('ab');
		expect(spy).toHaveBeenCalledWith('abc');
		expect(spy).toHaveBeenCalledWith('abcd');
	});

	test('When pressing the "Enter" key, leaves editing mode', async () => {
		const user = userEvent.setup();

		const {
			getByRole,
			queryByRole,
		} = render(
			<InlineNote
				note={null}
				onNoteChange={() => {}}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);
		expect(queryByRole('textbox')).toBeInTheDocument();

		// Pressing enter should exit edit mode
		await user.keyboard('{Enter}');
		expect(queryByRole('textbox')).not.toBeInTheDocument();
	});

	test('When pressing the "Escape" key, leaves editing mode and reverts the content', async () => {
		const user = userEvent.setup();
		const onNoteChange = jest.fn();

		const {
			getByRole,
			queryByRole,
		} = render(
			<InlineNote
				note={'Initial note'}
				onNoteChange={onNoteChange}
				saveChanges={() => {}}
			/>
		);

		const editButton = getByRole('button', { name: 'Edit note' });
		await user.click(editButton);
		expect(queryByRole('textbox')).toBeInTheDocument();

		await user.keyboard('Updated note');

		expect(onNoteChange).toHaveBeenLastCalledWith('Initial noteUpdated note');

		// Pressing escape should exit edit mode
		await user.keyboard('{Escape}');
		expect(queryByRole('textbox')).not.toBeInTheDocument();

		// Make sure note has reverted
		expect(onNoteChange).toHaveBeenLastCalledWith('Initial note');
	});

	test('leaves editing mode when keyboard focus moves elsewhere', async () => {
		const user = userEvent.setup();

		const {
			getByRole,
			queryByRole,
		} = render(
			<InlineNote
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

	test('calls saveChanges when leaving editing mode, if the note was changed', async () => {
		const user = userEvent.setup();
		const spy = jest.fn();

		const {
			getByRole,
			queryByRole,
		} = render(
			<InlineNote
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
		await user.keyboard('{Enter}');

		expect(queryByRole('textbox')).not.toBeInTheDocument();
		expect(spy).toHaveBeenCalled();
	});

	describe('if the tab is unloaded while in editing mode', () => {
		test('if there are unsaved changes, cancels the event', async () => {
			const user = userEvent.setup();

			const note = 'Test note';

			const {
				getByRole,
			} = render(
				<InlineNote
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
				<InlineNote
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
