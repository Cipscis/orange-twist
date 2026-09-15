import type { Status } from '../types';
import { ObjectStoreName } from '../metadata';
import { getStatusInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single status.
 */
export async function loadStatus(id: number): Promise<Status | null> {
	const transaction = await requestTransaction([ObjectStoreName.STATUS], 'readonly');

	const status = await getStatusInternal(transaction, id);

	return status;
}
