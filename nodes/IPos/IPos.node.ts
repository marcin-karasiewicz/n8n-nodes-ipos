import type {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
} from 'n8n-workflow';
import type { IposCredentials } from './authorization';

import { NodeConnectionType } from 'n8n-workflow';
import { authenticate } from './authorization';
import { isUserLoggedIn } from "./user";

export class IPos implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'IPos',
		name: 'iPos',
		icon: { light: 'file:ipos.svg', dark: 'file:ipos.svg' },
		group: ['transform'],
		version: 1,
		description: 'Basic IPos',
		defaults: {
			name: 'IPos',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'iposApi',
				required: true,
			},
		],
		properties: [],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		this.logger.debug('[iPos] Execute IPos API');

		this.logger.debug('[iPos] Get credentials');
		const credentials = (await this.getCredentials('iposApi')) as IposCredentials;

		this.logger.debug('[iPos] Check if user is logged in');
		if (!await isUserLoggedIn(this)) {
			this.logger.debug('[iPos] User is not logged in, authenticating...');
			await authenticate(this, credentials);
		}
		this.logger.debug('[iPos] User is logged in, proceeding with execution');

		// Execute the main logic of the node here
		// ...

		return [returnData];
	}
}
