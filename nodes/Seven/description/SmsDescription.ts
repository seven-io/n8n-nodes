import { INodeProperties } from 'n8n-workflow';

export const smsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sms'],
			},
		},
		options: [
			{
				name: 'Send',
				value: 'send',
				description: 'Send SMS',
				action: 'Send an SMS',
			},
		],
		default: 'send',
	},
];

const smsSendProperties: INodeProperties[] = [
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['sms'],
			},
		},
		description: 'The message to send',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		placeholder: '+49876543210, MyGroup',
		required: true,
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['sms'],
			},
		},
		description:
			'The number of your recipient(s) separated by comma. Can be regular numbers or contact/groups from seven.',
	},
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		default: '',
		placeholder: '+4901234567890',
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['sms'],
			},
		},
		description:
			'The caller ID displayed in the receivers display. Max 16 numeric or 11 alphanumeric characters.',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['sms'],
			},
		},
		options: [
			{
				displayName: 'Delay',
				name: 'delay',
				type: 'dateTime',
				default: '',
				description: 'Pick a date for time delayed dispatch',
			},
			{
				displayName: 'Flash',
				name: 'flash',
				type: 'boolean',
				default: false,
				// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
				description: "Send as flash message being displayed directly the receiver's display",
			},
			{
				displayName: 'Foreign ID',
				typeOptions: {
					maxValue: 64,
				},
				name: 'foreign_id',
				type: 'string',
				default: '',
				placeholder: 'MyCustomForeignID',
				description: 'Custom foreign ID returned in DLR callbacks',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				typeOptions: {
					maxValue: 100,
				},
				default: '',
				placeholder: 'MyCustomLabel',
				description: 'Custom label used to group analytics',
			},
			{
				displayName: 'Performance Tracking',
				name: 'performance_tracking',
				type: 'boolean',
				default: false,
				description: 'Whether to enable performance tracking for URLs found in the message text',
			},
			{
				displayName: 'TTL',
				name: 'ttl',
				type: 'number',
				default: 2880,
				typeOptions: {
					minValue: 1,
				},
				description: 'Custom time to live specifying the validity period of a message in minutes',
			},
		],
	},
];

export const smsFields: INodeProperties[] = [
	...smsSendProperties
];
