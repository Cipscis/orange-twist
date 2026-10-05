import {
	h,
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
	getDayInfo,
	loadAllRegisters,
	setDayInfo,
} from 'data';

import {
	KeyboardShortcutName,
	registerKeyboardShortcut,
	useKeyboardShortcut,
} from 'registers/keyboard-shortcuts';

import {
	classNames,
	type DefaultsFor,
	getCurrentDateDayName,
} from 'utils';

import { type PersistApi, local } from 'persist';
import {
	onSyncUpdate,
} from 'sync';

import * as ui from 'ui';
import {
	IconButton,
} from '../shared';
import { IconName } from 'types/IconName';

import { OrangeTwistContext } from '../OrangeTwistContext';

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
	 * If set, attempts to scroll to the current day on load.
	 *
	 * @default false
	 */
	scrollToToday?: boolean;
	/**
	 * The method that should be used for persisting data.
	 *
	 * @default local
	 */
	persist?: PersistApi;

	children?: ComponentChildren;
}

const defaultProps = {
	backButton: false,
	scrollToToday: false,
	persist: local,
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
		scrollToToday,
		persist,
		children,
	} = {
		...defaultProps,
		...props,
	};

	const [isLoading, setIsLoading] = useState(true);

	/**
	 * Load persisted data into each register.
	 *
	 * This function does **not** interact with loading state.
	 */
	const loadAllData = useCallback(async () => {
		await loadAllRegisters(persist);

		// If there's no info for the current day, set up a stub
		const currentDateDayName = getCurrentDateDayName();
		if (getDayInfo(currentDateDayName) === null) {
			setDayInfo(currentDateDayName, {});
		}
	}, [persist]);

	// Load persisted data on initial load
	useEffect(() => {
		loadAllData()
			.then(() => setIsLoading(false))
			.catch((e) => {
				ui.alert(
					'Failed to load',
					{
						duration: null,
						dismissible: true,
					}
				);
				console.error(e);
			});
	}, [
		loadAllData,
	]);

	// Scroll to first open day when initial loading is complete
	const hasDoneInitialScroll = useRef(false);
	useEffect(() => {
		if (hasDoneInitialScroll.current || !scrollToToday) {
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
	}, [scrollToToday]);

	// Load persisted data when serialised data
	// is updated from another source
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		onSyncUpdate(
			() => {
				setIsLoading(true);
				loadAllData()
					.then(() => setIsLoading(false));
			},
			{ signal }
		);

		return () => controller.abort();
	}, [
		loadAllData,
	]);

	useCommandDataSave({ persist });
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

	return <OrangeTwistContext.Provider
		value={{
			isLoading,
		}}
	>
		{
			__IS_DEV__ && <span class="dev-ribbon">unreleased</span>
		}

		<CommandPalette
			open={commandPaletteOpen}
			onClose={closeCommandPalette}
		/>

		<div
			class={classNames('orange-twist', {
				'orange-twist--loading': isLoading,
			})}
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

			{!isLoading && children}

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
	</OrangeTwistContext.Provider>;
}
