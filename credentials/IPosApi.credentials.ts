import {
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';


/**
 * n8n Credential for authenticating against the IPos API.
 * Only collects the basic login pair (email + password) which
 * is then used to obtain an access token during node execution.
 */
export class IPosApi implements ICredentialType {
	/** Internal credential name used by nodes to reference this credential */
	name = 'iposApi';
	/** Human-friendly label shown in the n8n UI */
	displayName = 'IPos API';
	documentationUrl = 'http://iposweb.pl';
	/** Custom icon bundled with this package (relative path resolved by n8n) */
	icon: Icon = 'file:ipos.svg';
	/**
	 * Fields displayed in the Credentials modal.
	 * These do not perform authentication on their own; they are inputs
	 * used by the node to request a token from the API at runtime.
	 */
	properties: INodeProperties[] = [
		{
			// IPos account email used for login
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
		},
		{
			// IPos account password; masked in the UI via typeOptions.password
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
