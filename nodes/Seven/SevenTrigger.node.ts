import {
	NodeConnectionTypes,
	type IDataObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

import { sevenApiRequest } from './GenericFunctions';
import { verifySignature } from './helpers/signing';

const ALL_EVENTS = [
	'sms_mo',
	'dlr',
	'tracking',
	'voice_call',
	'voice_status',
	'voice_dtmf',
	'rcs',
	'wa_mo',
] as const;

export class SevenTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'seven Trigger',
		name: 'sevenTrigger',
		icon: 'file:seven.svg',
		group: ['trigger'],
		version: 1,
		description: 'Receive seven webhook events (incoming SMS, DLR, voice, RCS, WhatsApp)',
		defaults: {
			name: 'seven Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'sevenApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
			{
				name: 'sevenOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
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
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: [
					{ name: 'Delivery Report (DLR)', value: 'dlr' },
					{ name: 'Inbound SMS', value: 'sms_mo' },
					{ name: 'Inbound WhatsApp', value: 'wa_mo' },
					{ name: 'Performance Tracking', value: 'tracking' },
					{ name: 'RCS', value: 'rcs' },
					{ name: 'Voice Call', value: 'voice_call' },
					{ name: 'Voice DTMF', value: 'voice_dtmf' },
					{ name: 'Voice Status', value: 'voice_status' },
				],
				description: 'Webhook event types to subscribe to',
			},
			{
				displayName: 'Signing Key',
				name: 'signingKey',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description:
					'HMAC-SHA256 signing key from your seven account (Developer area). Leave empty to skip signature verification.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Event Filter',
						name: 'event_filter',
						type: 'string',
						default: '',
						description: 'Optional filter expression applied to webhook deliveries',
					},
					{
						displayName: 'Custom Headers (JSON)',
						name: 'headers',
						type: 'json',
						default: '',
						description: 'Custom headers to send with webhook requests',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				const response = (await sevenApiRequest.call(this, 'GET', '/hooks')) as IDataObject;
				const hooks = (response?.hooks as IDataObject[]) ?? [];

				const matching = hooks.filter(
					(hook) =>
						hook.target_url === webhookUrl &&
						(hook.event_type === 'all' || events.includes(hook.event_type as string)),
				);

				// Only report the webhook as existing when every selected event is
				// covered - otherwise create() must run to subscribe the missing ones.
				const coveredEvents = new Set(matching.map((hook) => hook.event_type as string));
				const allCovered =
					events.length > 0 &&
					(coveredEvents.has('all') || events.every((event) => coveredEvents.has(event)));

				if (!allCovered) return false;

				webhookData.hookIds = matching.map((hook) => hook.id as number);
				return true;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const additionalFields = this.getNodeParameter('additionalFields', {}) as IDataObject;
				const webhookData = this.getWorkflowStaticData('node');

				if (events.length === 0) return false;

				const eventTypes = events.length === ALL_EVENTS.length ? ['all'] : events;
				const createdIds: number[] = [];

				for (const eventType of eventTypes) {
					const body: IDataObject = {
						target_url: webhookUrl,
						event_type: eventType,
						request_method: 'JSON',
					};
					if (additionalFields.event_filter) body.event_filter = additionalFields.event_filter;
					if (additionalFields.headers) {
						body.headers =
							typeof additionalFields.headers === 'string'
								? additionalFields.headers
								: JSON.stringify(additionalFields.headers);
					}

					const response = (await sevenApiRequest.call(
						this,
						'POST',
						'/hooks',
						body,
					)) as IDataObject;
					if (response?.id !== undefined) {
						createdIds.push(response.id as number);
					}
				}

				if (createdIds.length === 0) return false;

				webhookData.hookIds = createdIds;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const ids = (webhookData.hookIds as number[] | undefined) ?? [];

				const failedIds: number[] = [];
				for (const id of ids) {
					try {
						await sevenApiRequest.call(this, 'DELETE', '/hooks', { id });
					} catch {
						failedIds.push(id);
					}
				}

				// Keep IDs whose unsubscribe failed so the orphaned remote hooks
				// stay tracked and the deletion can be retried.
				if (failedIds.length > 0) {
					webhookData.hookIds = failedIds;
					return false;
				}

				delete webhookData.hookIds;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const signingKey = this.getNodeParameter('signingKey', '') as string;

		if (signingKey && !verifySignature.call(this, signingKey)) {
			const res = this.getResponseObject();
			res.status(401).send('Unauthorized').end();
			return { noWebhookResponse: true };
		}

		const req = this.getRequestObject();
		return {
			workflowData: [this.helpers.returnJsonArray(req.body as IDataObject)],
		};
	}
}
