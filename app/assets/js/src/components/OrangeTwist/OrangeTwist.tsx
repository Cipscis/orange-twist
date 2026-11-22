import {
	h,
	Fragment,
	type ComponentChildren,
	type JSX,
} from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { useCommandDataSave } from './useCommandDataSave';
import { useCommandDataExport } from './useCommandDataExport';
import { useCommandDataImport } from './useCommandDataImport';
import { useCommandDayAddNew } from './useCommandDayAddNew';
import { useCommandTaskAddNew } from './useCommandTaskAddNew';
import { useCommandTaskGoToExisting } from './useCommandTaskGoToExisting';
import { useCommandThemeToggle } from './useCommandThemeToggle';
import { useCommandKeyboardShortcutShow } from './useCommandKeyboardShortcutShow';
import { useCommandTemplatesEdit } from './useCommandTemplatesEdit';

import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import type { DefaultsFor } from 'utils/DefaultsFor';
import { useDevEnhancements } from './useDevEnhancements';

import {
	IconButton,
} from '../shared';
import { IconName } from 'types/IconName';

import { CommandPalette } from '../CommandPalette';
import { KeyboardShortcutModal } from '../KeyboardShortcutsModal';
import { TemplatesModal } from '../templates/TemplatesModal';
import { ToolDrawer, ToolDrawerPlacement } from '../ToolDrawer';
import { Footer } from '../Footer';

interface OrangeTwistProps {
	/**
	 * If present, a back button will be shown.
	 *
	 * @default false
	 */
	backButton?: boolean;
	/**
	 * If set, attempts to scroll to the first open day on load.
	 *
	 * @default false
	 */
	scrollToActiveDay?: boolean;

	children?: ComponentChildren;
}

const defaultProps = {
	backButton: false,
	scrollToActiveDay: false,
} as const satisfies DefaultsFor<
	Omit<OrangeTwistProps, 'children'>
>;

/**
 * Renders a standard page layout and sets up
 * app-wide tools such as the command palette.
 */
export function OrangeTwist(props: OrangeTwistProps): JSX.Element {
	const {
		backButton,
		scrollToActiveDay,
		children,
	} = {
		...defaultProps,
		...props,
	};

	// Scroll to first open day when initial loading is complete
	const hasDoneInitialScroll = useRef(false);
	useEffect(() => {
		if (hasDoneInitialScroll.current || !scrollToActiveDay) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		// Poll for up to a second to see if the day has loaded
		const delay = 10;
		const maxTime = 1_000;
		const maxAttempts = maxTime / delay;
		let counter = 0;

		const interval = setInterval(() => {
			const firstOpenDay = document.querySelector('.js-day:open');
			if (!firstOpenDay) {
				counter += 1;
				if (counter >= maxAttempts) {
					controller.abort();
				}

				return;
			}

			firstOpenDay.scrollIntoView({
				behavior: 'instant',
			});
			hasDoneInitialScroll.current = true;
			controller.abort();
		}, delay);
		signal.addEventListener('abort', () => clearInterval(interval));

		return () => controller.abort();
	}, [scrollToActiveDay]);

	useCommandDataSave();
	useCommandDataExport();
	useCommandDataImport();
	useCommandDayAddNew();
	useCommandTaskAddNew();
	useCommandTaskGoToExisting();
	useCommandThemeToggle();
	const {
		keyboardShortcutsModalOpen,
		openKeyboardShortcutsModal,
		closeKeyboardShortcutsModal,
	} = useCommandKeyboardShortcutShow();
	const {
		templatesModalOpen,
		closeTemplatesModal,
	} = useCommandTemplatesEdit();

	// Register keyboard shortcuts
	useEffect(() => {
		registerKeyboardShortcut(
			KeyboardShortcutName.COMMAND_PALETTE_OPEN,
			[{
				key: '\\',
			}],
		);
		registerKeyboardShortcut(
			KeyboardShortcutName.EDITING_FINISH,
			[
				{ key: 'Enter', ctrl: true },
				{ key: 'Escape' },
			]
		);
	}, []);

	// Open command palette on keyboard shortcut
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
	/** Open the command palette. */
	const openCommandPalette = useCallback(
		() => setCommandPaletteOpen(true),
		[]
	);
	/** Close the command palette. */
	const closeCommandPalette = useCallback(
		() => setCommandPaletteOpen(false),
		[]
	);
	useKeyboardShortcut(
		KeyboardShortcutName.COMMAND_PALETTE_OPEN,
		openCommandPalette,
		!commandPaletteOpen
	);

	if (__IS_DEV__) {
		// This hook is not actually called conditionally, the __IS_DEV__ check is determined at build time
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useDevEnhancements();
	}

	return <>
		{
			__IS_DEV__ && <span class="dev-ribbon">unreleased</span>
		}

		<CommandPalette
			open={commandPaletteOpen}
			onClose={closeCommandPalette}
		/>

		<div
			class="orange-twist"
		>
			<ToolDrawer side={ToolDrawerPlacement.LEFT}>
				{
					backButton &&
						<IconButton
							icon={IconName.CHEVRON_LEFT}
							title="Back"
							href="../"
						/>
				}
			</ToolDrawer>

			<h1 class="orange-twist__heading">Orange Twist</h1>

			<ToolDrawer side={ToolDrawerPlacement.RIGHT}>
				<IconButton
					icon="\"
					title="Open command palette"
					onClick={openCommandPalette}
				/>

				<IconButton
					icon="?"
					title="Show keyboard shortcuts"
					onClick={openKeyboardShortcutsModal}
				/>
			</ToolDrawer>

			{children}

			<Footer />
		</div>

		<KeyboardShortcutModal
			open={keyboardShortcutsModalOpen}
			onClose={closeKeyboardShortcutsModal}
		/>
		<TemplatesModal
			open={templatesModalOpen}
			onClose={closeTemplatesModal}
		/>
	</>;
}
