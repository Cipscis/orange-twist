import { h, type JSX } from 'preact';
import { useCallback, useContext } from 'preact/hooks';

import { getCurrentDateDayName } from 'utils';

import { useDayInfo } from 'data';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	Button,
	Loader,
	Note,
} from 'components/shared';
import { Day } from 'components/days/Day';
import { UnfinishedTaskList } from 'components/tasks/UnfinishedTaskList';

import { OrangeTwistContext } from './OrangeTwistContext';

/**
 * Render static content for the Help page.
 */
export function Help(): JSX.Element {
	const { isLoading } = useContext(OrangeTwistContext);

	const today = useDayInfo(getCurrentDateDayName());
	const createToday = useCallback(() => {
		fireCommand(Command.DAY_ADD_NEW, getCurrentDateDayName());
	}, []);

	const noop = useCallback(() => {}, []);

	return <>
		<section class="orange-twist__section">
			<div class="content">
				<h2>Help</h2>

				<p>Orange Twist is a web app for keeping track of notes and tasks.</p>

				<h3 id="privacy-first">Privacy First</h3>

				<p>Orange Twist is designed with privacy in mind. No data you enter into Orange Twist will be sent to any remote server, it all gets saved directly on your computer in your web browser's "local storage". Your changes are saved automatically as you work.</p>

				<p>Because of this, Orange Twist is best used on a single computer where you have secure access. If you need to use it across multiple devices, you can export and import your data in JSON format via the <a href="#command-palette">command palette</a>.</p>

				<p>Orange Twist doesn't make use of any trackers such as Google Analytics, and it doesn't use any cookies.</p>

				<h3 id="organisation-days">Organisation - Days</h3>

				<p>Orange Twist's first level of organisation is <strong>days</strong>. Here is everything Orange Twist knows about today:</p>
			</div>

			{
				today
					? (<Day
						day={today}
						open
					/>)
					: (<>
						<div class="content">
							<p>You don't have any data for today.</p>
							<Button
								onClick={createToday}
							>Create data for today</Button>
						</div>
					</>)
			}

			<div className="content">
				<p>You can add notes against a day by pressing the edit button. See <a href="#notes">Notes</a> for more information.</p>

				<h3 id="organisation-tasks">Organisation - Tasks</h3>

				<p>Orange Twist's second level of organisation is <b>tasks</b>. Here are all the open tasks Orange Twist knows about, try adding one if you don't have any:</p>
			</div>

			<UnfinishedTaskList />

			<div class="content">
				<p>Although they can exist on their own, tasks are designed to be added against each day when you work on them.</p>

				<p>Like <a href="#notes">notes</a>, tasks' names can also use Markdown. Tasks also have a status, and keep track of the status they had on each day they were worked on.</p>

				<p>On a task's detail page, you can view and edit a task's notes and its daily statuses.</p>

				<p>On <a href="/">Orange Twist's main page</a>, tasks are organised at the bottom into open and completed tasks. You can add an existing task to your current day by selecting a status for it in the open tasks list, or by going to its detail view and using the "Add day" button.</p>

				<h3 id="notes">Notes</h3>

				<p>Several areas of Orange Twist allow for notes to be added and edited. You can use <a href="https://www.markdownguide.org/" target="_blank" rel="noreferrer">Markdown</a> to format these notes.</p>

				<p>If you want to link to a specific task, you can use a "[[taskId]]" shortcode, e.g. "[[1]]" would generate a link to task 1 like this:</p>
			</div>

			{isLoading
				? <Loader />
				: <Note
					note="[[1]]"
					onNoteChange={noop}
					saveChanges={noop}
				/>
			}

			<div class="content">
				<h3 id="command-palette">Command Palette</h3>

				<p>The command palette can be used to quickly perform actions with the keyboard, or to perform certain advanced actions.</p>

				<p>The command palette can be opened by the keyboard shortcut <kbd>\</kbd>, or by pressing the "\" button in the drawer in the top right.</p>

				<h3 id="keyboard-shortcuts">Keyboard Shortcuts</h3>

				<p>Orange Twist has several keyboard shortcuts. To view all keyboard shortcuts, use the keyboard shortcut <kbd>?</kbd> or press the "?" button in the drawer in the top right.</p>
			</div>
		</section>
	</>;
}
