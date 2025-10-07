import { INodeProperties } from 'n8n-workflow';

export const lookupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['lookup'],
			},
		},
		options: [
			{
				name: 'CNAM',
				value: 'cnam',
				description: 'Lookup caller name of a phone number',
				action: 'Lookup CNAM',
			},
			{
				name: 'Format',
				value: 'format',
				description: 'Lookup format of a phone number',
				action: 'Lookup format',
			},
			{
				name: 'HLR',
				value: 'hlr',
				description: 'Lookup home location register of a phone number',
				action: 'Lookup HLR',
			},
			{
				name: 'MNP',
				value: 'mnp',
				description: 'Lookup mobile number portability status of a phone number',
				action: 'Lookup MNP',
			},
			{
				name: 'RCS',
				value: 'rcs',
				description: 'Lookup RCS capabilities of a phone number',
				action: 'Lookup RCS',
			},
		],
		default: 'format',
	},
];

const lookupStartProperties: INodeProperties[] = [
	{
		displayName: 'Number',
		name: 'number',
		type: 'string',
		default: '',
		placeholder: '+491716992343',
		required: true,
		displayOptions: {
			show: {
				operation: ['cnam', 'format', 'hlr', 'mnp', 'rcs'],
				resource: ['lookup'],
			},
		},
		description: 'The phone number for looking up',
	},
];

export const lookupFields: INodeProperties[] = [...lookupStartProperties];
