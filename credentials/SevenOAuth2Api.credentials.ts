import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SevenOAuth2Api implements ICredentialType {
	extends = ['oAuth2Api'];
	displayName = 'Seven OAuth2 API';
	documentationUrl = 'https://docs.seven.io/en/rest-api/oauth2.0';
	name = 'sevenOAuth2Api';
	properties: INodeProperties[] = [
		{
			default: 'authorizationCode',
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
		},
		{
			default: 'https://oauth.seven.io/authorize',
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
		},
		{
			default: 'https://oauth.seven.io/token',
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
		},
		{
			default: '',
			displayName: 'Client ID',
			name: 'clientId',
			required: true,
			type: 'string',
		},
		{
			default: '',
			displayName: 'Client Secret',
			name: 'clientSecret',
			required: true,
			type: 'string',
			typeOptions: { password: true },
		},
		{
			default: '',
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
		},
		{
			default: 'grant_type=authorization_code',
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
		},
		{
			default: 'header',
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
		},
	];
}
