import { INodeProperties } from 'n8n-workflow';

export const voiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['voice'],
			},
		},
		options: [
			{
				action: 'Convert text to voice',
				description: 'Converts text to voice and calls a given number',
				name: 'Send',
				value: 'send',
			},
		],
		default: 'send',
	},
];

const voiceSendProperties: INodeProperties[] = [
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['voice'],
			},
		},
		description: 'Text message to be read out. Optionally as simple text or as SSML.',
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
				resource: ['voice'],
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
		placeholder: '+491716992343',
		displayOptions: {
			show: {
				operation: ['send'],
				resource: ['voice'],
			},
		},
		description:
			'Caller ID of the call. Please only use verified sender IDs or one of your numbers booked with us here.',
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
				resource: ['voice'],
			},
		},
		options: [
			{
				displayName: 'Ringtime',
				name: 'ringtime',
				type: 'number',
				typeOptions: {
					maxValue: 60,
					minValue: 5,
				},
				default: null,
				description:
					"The duration of how long it should ring at the recipient's end before hanging up. Here, 5 to 60 seconds are possible.",
			},
			{
				displayName: 'Foreign ID',
				name: 'foreign_id',
				type: 'string',
				default: '',
				description:
					'A unique ID that you can use for later assignment of the call. This ID is passed in the webhook events.',
			},
		],
	},
];

export const voiceFields: INodeProperties[] = [...voiceSendProperties];
