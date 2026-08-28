import type { RefObject } from 'preact';
import { useEffect, type MutableRef } from 'preact/hooks';

import {
	createImageUrlPlaceholder,
	hasImage,
	saveImage,
} from 'images';

import * as ui from 'ui';

const maxFileSize = 1024 * 1024 * 5; // 5 MB

export interface UseListenForImagesOptions {
	editorRef: RefObject<
		HTMLElement &
		Pick<HTMLTextAreaElement, 'value' | 'selectionStart' | 'selectionEnd'>
	>;
	isConfirmingAttachLargeImageRef: MutableRef<boolean>;
	condition: boolean;
}

/**
 * Allow an editable HTML element like a `<textarea>` to receive images via paste or drag & drop.
 *
 * If a large image that hasn't already been saved gets inserted, the user will be prompted for confirmation. The presence of this state is exported via the `isConfirmingAttachLargeImageRef` option.
 */
export function useListenForImages(
	options: UseListenForImagesOptions,
): void {
	const {
		editorRef,
		isConfirmingAttachLargeImageRef,
		condition,
	} = options;

	useEffect(() => {
		const editor = editorRef.current;
		if (!(
			condition &&
			editor
		)) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		/**
		 * Retrieves an image from a `DataTransfer` object, if it has one.
		 */
		const getImage = (
			dataTransfer: DataTransfer | null
		): File | null => {
			const file = dataTransfer?.files?.[0];
			if (!file) {
				return null;
			}

			if (!file.type.startsWith('image/')) {
				return null;
			}

			return file;
		};

		/**
		 * Inserts text into the textarea to render a given image.
		 */
		const insertImage = async (file: File) => {
			// If the image is too large, and hasn't been stored already,
			// ask for confirmation before storing it
			if (file.size > maxFileSize && !await hasImage(file)) {
				const maxFileSizeString = `${(maxFileSize / (1024 * 1024)).toFixed(1)} MB`;
				const thisFileSizeString = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

				isConfirmingAttachLargeImageRef.current = true;
				const permission = await ui.confirm(`It's recommended that files be kept below ${maxFileSizeString}. This file is ${thisFileSizeString}, are you sure you want to store it?`);

				isConfirmingAttachLargeImageRef.current = false;
				editorRef.current?.focus();

				if (!permission) {
					return;
				}
			}
			const hash = await saveImage(file);

			const valueArr = [...editor.value];
			const { selectionStart, selectionEnd } = editor;
			const selectionSize = selectionEnd - selectionStart;

			const urlPlaceholder = createImageUrlPlaceholder(hash);
			const insertedContent = `![](${urlPlaceholder})`;
			valueArr.splice(selectionStart, selectionSize, insertedContent);

			editor.value = valueArr.join('');
			// Move text cursor to where alt text will go
			editor.selectionStart = selectionStart + 2;
			editor.selectionEnd = selectionStart + 2;
		};

		// Listen for pasted images, and insert them.
		editor.addEventListener(
			'paste',
			(e) => {
				const file = getImage(e.clipboardData);
				if (!file) {
					return;
				}

				insertImage(file);
			},
			{ signal }
		);

		// Allow images to be dragged and dropped into the textarea.
		editor.addEventListener(
			'dragover',
			(e) => {
				const items = Array.from(e.dataTransfer?.items ?? []);
				if (!items.some((item) => {
					if (item.kind !== 'file') {
						return false;
					}
					if (!item.type.startsWith('image/')) {
						return false;
					}
					return true;
				})) {
					return;
				}

				e.preventDefault();
			},
			{ signal }
		);

		// Listen for images being dropped, and insert them.
		editor.addEventListener(
			'drop',
			(e) => {
				const file = getImage(e.dataTransfer);
				if (!file) {
					return;
				}
				insertImage(file);
				e.preventDefault();
			},
			{ signal }
		);

		return () => controller.abort();
	}, [
		editorRef,
		condition,
		isConfirmingAttachLargeImageRef,
	]);
}
