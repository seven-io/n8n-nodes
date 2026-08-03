import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const SEVEN_API_BASE_URL = 'https://gateway.seven.io/api';

type SevenContext = IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions;

function resolveCredentialType(ctx: SevenContext): string {
	// The 'authentication' parameter is read the same way in every context;
	// in hook/webhook contexts the second argument acts as the fallback value.
	let authentication: unknown = 'accessToken';
	try {
		authentication = (ctx as IExecuteFunctions).getNodeParameter('authentication', 0, 'accessToken');
	} catch {
		// node has no authentication parameter - default to API key
	}
	return authentication === 'oAuth2' ? 'sevenOAuth2Api' : 'sevenApi';
}

export async function sevenApiRequest(
	this: SevenContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	sendAsForm = false,
): Promise<any> {
	const options: IRequestOptions = {
		method,
		uri: `${SEVEN_API_BASE_URL}${endpoint}`,
		qs,

		headers: {
			SentWith: 'n8n',
			Accept: 'application/json',
		},
		json: true,
	};

	if (Object.keys(body).length > 0) {
		// POST /contacts and POST /groups only read form-encoded bodies ($_POST);
		// every other endpoint accepts JSON.
		if (sendAsForm) {
			options.form = body;
		} else {
			options.body = body;
		}
	}

	let response;
	try {
		response = await this.helpers.requestWithAuthentication.call(
			this,
			resolveCredentialType(this),
			options,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}

	// Some endpoints report failures with HTTP 200: either { success: false, ... }
	// or a legacy string status code where only "100" means accepted (SMS, Voice,
	// RCS, WhatsApp sends). Responses without a success field pass through untouched.
	if (response !== null && typeof response === 'object') {
		const success = (response as IDataObject).success;
		if (success === false || (typeof success === 'string' && success !== '100')) {
			throw new NodeApiError(this.getNode(), response as JsonObject, {
				message: 'The seven API reported a failure',
			});
		}
	}

	return response;
}

export async function sevenApiRequestAllItems(
	this: SevenContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];

	const limit = (qs.limit as number) || 100;
	let offset = (qs.offset as number) || 0;

	qs.limit = limit;

	let hasMore = true;
	while (hasMore) {
		qs.offset = offset;
		const responseData: IDataObject | IDataObject[] = await sevenApiRequest.call(
			this,
			method,
			endpoint,
			body,
			qs,
		);

		const items = Array.isArray(responseData)
			? responseData
			: ((responseData?.data as IDataObject[]) ?? []);

		if (items.length === 0) {
			hasMore = false;
			break;
		}

		returnData.push.apply(returnData, items);
		offset += items.length;

		if (items.length < limit) hasMore = false;
	}

	return returnData;
}
