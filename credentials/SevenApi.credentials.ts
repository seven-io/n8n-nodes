import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SevenApi implements ICredentialType {
	name = 'sevenApi';

	displayName = 'Seven API';

	documentationUrl = 'https://docs.seven.io/third-party/automation/n8n';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://gateway.seven.io/api',
			url: '/hooks',
			qs: {
				action: 'read',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'success',
					message: 'Invalid API Key',
					value: undefined,
				},
			},
		],
	};
}
