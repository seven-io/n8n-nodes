import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function sevenApiRequest(
	this: IHookFunctions | IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject,
	qs: IDataObject = {},
): Promise<any> {
	const options: IRequestOptions = {
		headers: {
			SentWith: 'n8n',
		},
		qs,
		uri: `https://gateway.seven.io/api${endpoint}`,
		json: true,
		method,
	};

	if (Object.keys(body).length) {
		options.form = body;
	}

	const response = await this.helpers.requestWithAuthentication.call(this, 'sevenOAuth2Api', options);

	if (response.success !== '100') {
		throw new NodeApiError(this.getNode(), response as JsonObject, {
			message: 'Invalid seven credentials or API error!',
		});
	}

	return response;
}
