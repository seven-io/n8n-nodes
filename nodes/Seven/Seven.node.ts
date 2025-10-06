import {
	NodeConnectionType,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	INodeProperties,
} from 'n8n-workflow';

import { sevenApiRequest } from './GenericFunctions';
import { smsFields, smsOperations } from './description/SmsDescription';
import { rcsFields, rcsOperations } from './description/RcsDescription';
import { voiceFields, voiceOperations } from './description/VoiceDescription';

const resources: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'SMS',
				value: 'sms',
			},
			{
				name: 'Voice Call',
				value: 'voice',
			},
			{
				name: 'RCS Message',
				value: 'rcs',
			},
		],
		default: 'sms',
	},
];

export class Seven implements INodeType {
	description: INodeTypeDescription = {
		requestDefaults: {
			baseURL: 'https://gateway.seven.io/api',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		displayName: 'seven',
		name: 'seven',
		icon: 'file:seven.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send SMS, RCS and make text-to-speech calls',
		defaults: {
			name: 'seven',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			/*			{
				name: 'sevenApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},*/
			{
				name: 'sevenOAuth2Api',
				required: true,
				/*				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},*/
			},
		],
		properties: [
			/*			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'accessToken',
				description: 'Means of authenticating with the service',
			},*/
			...resources,
			...smsOperations,
			...smsFields,
			...rcsOperations,
			...rcsFields,
			...voiceOperations,
			...voiceFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: IDataObject[] = [];

		for (let i = 0; i < this.getInputData().length; i++) {
			const resource = this.getNodeParameter('resource', i);
			const operation = this.getNodeParameter('operation', i);
			let responseData;
			try {
				if (resource === 'sms' && operation === 'send' ) {
					const from = this.getNodeParameter('from', i) as string;
					const to = this.getNodeParameter('to', i) as string;
					const text = this.getNodeParameter('text', i) as string;
					const options = this.getNodeParameter('options', i);
					const body = {
						from,
						to,
						text,
						...options,
					};
					responseData = await sevenApiRequest.call(this, 'POST', '/sms', body);
				}

				if (resource === 'voice' && operation === 'send') {
					const from = this.getNodeParameter('from', i) as string;
					const to = this.getNodeParameter('to', i) as string;
					const text = this.getNodeParameter('message', i) as string;
					const options = this.getNodeParameter('options', i);
					const body = {
						from,
						to,
						text,
						...options,
					};
					responseData = await sevenApiRequest.call(this, 'POST', '/voice', body);
				}

				if (resource === 'rcs' && operation === 'send') {
					const from = this.getNodeParameter('from', i) as string;
					const to = this.getNodeParameter('to', i) as string;
					const text = this.getNodeParameter('message', i) as string;
					const options = this.getNodeParameter('options', i);
					const body = {
						from,
						to,
						text,
						...options,
					};
					responseData = await sevenApiRequest.call(this, 'POST', '/rcs/messages', body);
				}

				if (Array.isArray(responseData)) {
					returnData.push.apply(returnData, responseData as IDataObject[]);
				} else if (responseData !== undefined) {
					returnData.push(responseData as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
