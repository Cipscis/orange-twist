import { RefObject, createRef, h } from 'preact';
import htm from 'htm';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import classNames from 'classnames';

// Initialise htm with Preact
const html = htm.bind(h);

interface CommandPaletteProps {
	open: boolean;

	onClose?: () => void;
}

export function CommandPalette(props: CommandPaletteProps) {
	const {
		open,
		onClose,
	} = props;

	const fieldRef = useRef<HTMLInputElement>(null);

	// TODO: This is just a static placeholder
	const commands = useMemo(() => [
		{
			id: 'add-new-task',
			label: 'Add new task',
			action() { console.log('Add new task'); },
		},
		{
			id: 'add-new-day',
			label: 'Add new day',
			action() { console.log('Add new day'); },
		},
		{
			id: 'secret-third-thing',
			label: 'A secret third thing',
			action() { console.log('A secret third thing'); },
		},
	], []);
	const optionsRef = useRef<RefObject<HTMLElement>[]>([]);
	optionsRef.current = commands.map((command, i) => optionsRef.current[i] ?? createRef<HTMLElement>());

	const [activeDescendant, setActiveDescendant] = useState<HTMLElement | null>(null);

	// Handle opening, closing, and active descendant management.
	useEffect(() => {
		const closeOnEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && onClose) {
				onClose();
			}
		};

		const adjustActiveDescendant = (e: KeyboardEvent) => {
			if (!(e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
				return;
			}

			e.preventDefault();

			if (activeDescendant) {
				// TODO: Find existing ID, modify it, then update `activeDescendant`
				const currentActiveDescendantIndex = optionsRef.current.findIndex((ref) => ref.current === activeDescendant);
				if (currentActiveDescendantIndex !== -1) {
					// TODO: Set new `activeDescendant`
					const numOptions = optionsRef.current.length;
					if (e.key === 'ArrowDown') {
						const newActiveDescendantIndex = (currentActiveDescendantIndex + 1) % numOptions;
						setActiveDescendant(optionsRef.current[newActiveDescendantIndex].current);
					} else {
						const newActiveDescendantIndex = (currentActiveDescendantIndex + numOptions - 1) % numOptions;
						setActiveDescendant(optionsRef.current[newActiveDescendantIndex].current);
					}

					return;
				}
			}

			// Set it to the first or last, based on what was pressed
			if (e.key === 'ArrowDown') {
				setActiveDescendant(optionsRef.current[0].current);
			} else {
				setActiveDescendant(optionsRef.current[optionsRef.current.length - 1].current);
			}
		};

		const selectActiveDescendant = (e: KeyboardEvent) => {
			if (e.key === 'Enter' && activeDescendant) {
				e.preventDefault();
				activeDescendant.click();
			}
		};

		if (open) {
			fieldRef.current?.focus();
			document.addEventListener('keydown', closeOnEscape);
			document.addEventListener('keydown', adjustActiveDescendant);
			document.addEventListener('keydown', selectActiveDescendant);
		} else {
			setActiveDescendant(null);
		}

		return () => {
			if (open) {
				document.removeEventListener('keydown', closeOnEscape);
				document.removeEventListener('keydown', adjustActiveDescendant);
				document.removeEventListener('keydown', selectActiveDescendant);
			}
		};
	}, [open, activeDescendant]);

	return html`
		${
			open &&
			html`
				<div class="command-palette">
					<div>
						<div class="command-palette__field">
							<input
								ref="${fieldRef}"
								type="text"
								class="command-palette__field-input"

								aria-role="combobox"
								aria-expanded="true"
								aria-haspopoup="listbox"
								aria-controls="command-palette__options"
								aria-activedescendant="${activeDescendant?.id ?? null}"
							/>
						</div>
						<div
							id="command-palette__options"
							class="command-palette__options"
							role="listbox"
						>
							${commands.map((command, i) => html`
								<button
									key="${command.id}"
									type="button"
									ref="${optionsRef.current[i]}"
									id="${command.id}"
									class="${classNames({
										'command-palette__option': true,
										'command-palette__option--active': activeDescendant !== null && optionsRef.current[i].current === activeDescendant,
									})}"
									onClick="${() => {
										command.action();
										onClose?.();
									}}"
								>
									${command.label}
								</button>
							`)}
						</div>
					</div>
				</div>
			`
		}
	`;
}
