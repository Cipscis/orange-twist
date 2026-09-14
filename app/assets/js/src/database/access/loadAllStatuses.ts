import { ObjectStoreName } from '../metadata';
import { getStatusesInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from all statuses.
 */
export async function loadAllStatuses(): ReturnType<typeof getStatusesInternal> {
	const transaction = await requestTransaction([ObjectStoreName.STATUS], 'readonly');

	const statuses = await getStatusesInternal(transaction);

	return statuses;
}
