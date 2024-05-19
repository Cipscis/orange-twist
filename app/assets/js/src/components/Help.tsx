import { h, type JSX } from 'preact';
import {
	useCallback,
	useContext,
	useState,
} from 'preact/hooks';

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

	const editTemplates = useCallback(() => {
		fireCommand(Command.TEMPLATES_EDIT);
	}, []);

	const [taskLinkNote, setTaskLinkNote] = useState('[[1]]');
	const [templateNote, setTemplateNote] = useState('{{issue|99|custom templates}}');
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

				<h4 id="notes-task-links">Task links</h4>

				<p>If you want to link to a specific task, you can use a <code>[[taskId]]</code> shortcode, e.g. <code>[[1]]</code> would generate a link to task 1 like this:</p>
			</div>

			{isLoading
				? <Loader />
				: <Note
					note={taskLinkNote}
					onNoteChange={setTaskLinkNote}
					saveChanges={noop}
				/>
			}

			<div class="content">
				<h4 id="notes-images">Images</h4>

				<p>Images can be embedded in notes by either pasting them in directly, or by dragging and dropping an image into a note that's in editing mode. While in editing mode, embedded images look like this:</p>

				<p><code>![Alt text](image:abcdef12)</code></p>

				<p>The <code>image:</code> URL placeholder is a generated reference to your image, which you shouldn't change. If you want to embed the same image in multiple notes, you can either reuse this placeholder manually, or add the image again.</p>

				<p>Images attached to notes are stored locally in your browser, and reusing the same image multiple times won't cause it to be stored more than once.</p>

				<h4 id="notes-templates">Templates</h4>

				<p>As well as the <code>[[taskId]]</code> shortcodes for task links, you can define custom templates using the edit templates command which you can access anywhere through the <a href="#command-palette">command palette</a>.</p>

				<p><Button onClick={editTemplates}>Edit templates</Button></p>

				<p>These templates use syntax similar to <a href="https://mediawiki.org/wiki/Help:Templates" target="_blank" rel="noreferrer">Wikimedia templates</a>.</p>

				<p>For example, a template with the name "issue", which renders a link to a GitHub issue, could be defined like this:</p>

				<pre><code>{`<a href="https://github.com/Cipscis/orange-twist/issues/{{{0}}}" target="_blank">{{{1|issue}}}</a>`}</code></pre>

				<p>Once defined, that template will let you use a shortcode in any note, identifying the template and passing some arguments to render it, without having to write out the entire content each time. For example:</p>

				<pre><code>{`{{issue|99|custom templates}}`}</code></pre>

				<p>Try it out here:</p>

				{isLoading
					? <Loader />
					: <Note
						note={templateNote}
						onNoteChange={setTemplateNote}
						saveChanges={noop}
					/>
				}

				<p>The supported syntax for templates includes:</p>

				<ul>
					<li>Templates are wrapped in double braces and identified by a case-insensitive name - <code>{`{{template-name}}`}</code></li>
					<li>Templates support arguments. In the template, these are inserted using triple braces around numbers - <code>{`{{{0}}}`}</code>. When invoking a template, these are passed with pipes - <code>{`{{template-name|arg0|arg1}}`}</code></li>
					<li>Template arguments can have default values where they are inserted, specified using a pipe - <code>{`{{{0|default}}}`}</code></li>
				</ul>

				<h3 id="command-palette">Command Palette</h3>

				<p>The command palette can be used to quickly perform actions with the keyboard, or to perform certain advanced actions.</p>

				<p>The command palette can be opened by the keyboard shortcut <kbd>\</kbd>, or by pressing the "\" button in the drawer in the top right.</p>

				<h3 id="keyboard-shortcuts">Keyboard Shortcuts</h3>

				<p>Orange Twist has several keyboard shortcuts. To view all keyboard shortcuts, use the keyboard shortcut <kbd>?</kbd> or press the "?" button in the drawer in the top right.</p>
			</div>
		</section>
	</>;
}
