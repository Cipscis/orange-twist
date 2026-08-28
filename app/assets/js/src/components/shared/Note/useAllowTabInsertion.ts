import type { RefObject } from 'preact';
import { useEffect } from 'preact/hooks';

export interface UseAllowTabInsertionOptions {
	editorRef: RefObject<
		HTMLElement &
		Pick<HTMLTextAreaElement, 'value' | 'selectionStart' | 'selectionEnd'>
	>;
	condition: boolean;
}

/**
 * Allow an editable HTML element like a `<textarea>` to insert tab characters when pressing the "Tab" key.
 */
export function useAllowTabInsertion(
	options: UseAllowTabInsertionOptions
): void {
	const {
		editorRef,
		condition,
	} = options;

	useEffect(() => {
		const editorEl = editorRef.current;
		if (!editorEl) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		if (condition) {
			editorEl.addEventListener(
				'keydown',
				(e) => {
					// Insert a tab character on tab press
					if (e.key === 'Tab') {
						e.preventDefault();

						const selectionStart = editorEl.selectionStart;
						const selectionEnd = editorEl.selectionEnd;

						const indentation = '\t';

						if (selectionStart === selectionEnd) {
							const beforeSelection = editorEl.value.substring(0, selectionStart);
							const afterSelection = editorEl.value.substring(selectionEnd);

							// Insert indentation at the caret
							editorEl.value = `${beforeSelection}${indentation}${afterSelection}`;
							editorEl.selectionStart = selectionStart + indentation.length;
							editorEl.selectionEnd = selectionEnd + indentation.length;
						}
					}
				},
				{ signal },
			);
		}

		return () => {
			controller.abort();
		};
	}, [editorRef, condition]);
}
