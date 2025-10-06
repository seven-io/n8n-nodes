import { INodeProperties } from 'n8n-workflow';

export const rcsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['rcs'],
			},
		},
		options: [
			{
				name: 'Send',
				value: 'send',
				description: 'Send a RCS message',
				action: 'Send RCS',
			},
		],
		default: 'send',
	},
];

const rcsSendProperties: INodeProperties[] = [
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['rcs'],
			},
		},
		description:
			'Text of the RCS message. To send a simple RCS message (without images, suggested replies, etc.), only enter the plain text of the message here. Otherwise, use an RCS object.',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		placeholder: '+491716992343',
		required: true,
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['rcs'],
			},
		},
		description:
			'The recipient number for your RCS message. This can also be a contact name or a group name.',
	},
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		default: '',
		placeholder: 'AgentABC',
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['rcs'],
			},
		},
		description:
			'The unique ID of your agent. You can view this in the Settings of your account. If not specified, the first RCS-capable sender will be used.',
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
				resource: ['rcs'],
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
				displayName: 'Fallback',
				name: 'fallback',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'SMS', value: 'sms' },
					{ name: 'Webview', value: 'webview' },
				],
				default: '',
				description:
					"If it is not possible to send an RCS message because, for example, the recipient's device does not support RCS, the message can be automatically sent through an alternative channel. If no fallback is specified, it is disabled.",
			},
			{
				displayName: 'Foreign ID',
				name: 'foreign_id',
				type: 'string',
				default: '',
				typeOptions: {
					maxValue: 64,
				},
				placeholder: 'MyCustomForeignID',
				description: 'Custom foreign ID returned in DLR callbacks',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				typeOptions: {
					maxValue: 100,
				},
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

export const rcsFields: INodeProperties[] = [...rcsSendProperties];
