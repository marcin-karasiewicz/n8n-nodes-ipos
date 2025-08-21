import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { BASE_URL } from './constans';

/** Base endpoint for authentication requests */
const AUTH_URL = `${BASE_URL}/auth`;
const TOKEN_EXPIRATION_TIME_MS = 10 * 60 * 1000; // 10 minutes

/** Credentials required by the IPos API. */
export type IposCredentials = {
	email: string;
	password: string;
};

/**
 * Minimal shape of the login response returned by the API.
 * Extend here if the API returns more fields that you care about.
 */
type LoginResponse = {
	accessToken?: string;
};

/**
 * Shape of the authorization info we persist alongside the workflow.
 */
export type AuthorizationResult = {
	accessToken: string;
	accessTokenObtainedAt: number;
};

/**
 * Store access token with obtain time in workflow staticData for this node.
 */
export function setAccessToken(context: IExecuteFunctions, token: string): void {
	const staticData = context.getWorkflowStaticData('global') as {
		accessToken?: string;
		accessTokenObtainedAt?: number;
	};

	staticData.accessToken = token;
	staticData.accessTokenObtainedAt = Date.now();
}

/** Check if cached token is still valid */
export function isTokenValid(context: IExecuteFunctions): boolean {
	const staticData = context.getWorkflowStaticData('global') as {
		accessToken?: string;
		accessTokenObtainedAt?: number;
	};

	if (!staticData.accessToken || !staticData.accessTokenObtainedAt) {
		return false;
	}

	const now = Date.now();
	return now - staticData.accessTokenObtainedAt < TOKEN_EXPIRATION_TIME_MS;
}

/**
 * Perform authentication and store token in staticData.
 * Throws NodeApiError with a friendly message if the request fails
 * or if the response lacks an access token.
 */
export async function authenticate(
	context: IExecuteFunctions,
	credentials: IposCredentials,
): Promise<void> {
	try {
		const response = (await context.helpers.httpRequest({
			method: 'POST',
			url: AUTH_URL,
			json: true,
			body: {
				login: credentials.email,
				password: credentials.password,
			},
		})) as LoginResponse;

		const accessToken = response?.accessToken;
		if (!accessToken) {
			throw new Error('Missing accessToken in authentication response');
		}

		setAccessToken(context, accessToken);
	} catch (error) {
		throw new NodeApiError(context.getNode(), error, { message: 'Authentication request failed' });
	}
}
