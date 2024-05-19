import { consumeImageUrlPlaceholder } from './consumeImageUrlPlaceholder';
import { createImageUrlPlaceholder } from './createImageUrlPlaceholder';

/**
 * Replace all image URL placeholders in a string with actual image URLs.
 *
 * @param content - The content that may contain image URL placeholders.
 *
 * @returns The passed content with all image URL placeholders replaced
 * with image URLs.
 */
export async function consumeAllImageUrlPlaceholders(content: string): Promise<string> {
	const imageUrlMatches = content.matchAll(/\bimage:([0-9a-f]{8})/g);
	const promises: Promise<string>[] = [];

	let updatedContent = content;

	for (const match of imageUrlMatches) {
		const hash = match[1];
		const placeholder = createImageUrlPlaceholder(hash);
		promises.push(
			consumeImageUrlPlaceholder(hash).then(
				(url) => updatedContent = updatedContent.replace(placeholder, url)
			)
		);
	}

	await Promise.allSettled(promises);
	return updatedContent;
}
