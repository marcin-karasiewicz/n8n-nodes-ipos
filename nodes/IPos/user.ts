import type { IExecuteFunctions } from 'n8n-workflow';
import type { IposCredentials } from './authorization';

import { NodeApiError } from 'n8n-workflow';
import { BASE_URL } from './constans';
import { isTokenValid, authenticate } from './authorization';

/** Endpoint to retrieve details about the current authenticated user */
const USER_URL = `${BASE_URL}/s/customers/user`;

/**
 * Fetch the current user's info using a valid bearer token.
 * Returns the raw API payload.
 */
export async function fetchUserInfo(context: IExecuteFunctions, token: string): Promise<any> {
	return context.helpers.httpRequest({
		method: 'GET',
		url: USER_URL,
		json: true,
		headers: { Authorization: `Bearer ${token}` },
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	});
}

/**
 * Verify that the cached token is present and accepted by the API.
 * We first check local validity (age/shape) and then perform
 * a lightweight user fetch; a 401 means the session is invalid.
 */
export async function isUserLoggedIn(context: IExecuteFunctions): Promise<boolean> {
	const staticData = context.getWorkflowStaticData('global') as { accessToken?: string };

	if (!isTokenValid(context) || !staticData.accessToken) {
		return false;
	}

	try {
		await fetchUserInfo(context, staticData.accessToken);
		return true;
	} catch (error: any) {
		context.logger.error('Failed to fetch user info', { error });
		if (error?.response?.statusCode === 401) {
			return false;
		}
		throw new NodeApiError(context.getNode(), error, { message: 'User check failed' });
	}
}

/**
 * Main entry used by nodes: ensure user is logged in.
 * If the user is not logged in or the token is invalid/expired,
 * it performs authentication using provided credentials.
 */
export async function login(
	context: IExecuteFunctions,
	credentials: IposCredentials,
): Promise<void> {
	const loggedIn = await isUserLoggedIn(context);
	if (!loggedIn) {
		await authenticate(context, credentials);
	}
}
