import type { IHookFunctions } from 'n8n-workflow';

import { SevenTrigger } from '../nodes/Seven/SevenTrigger.node';
import * as GenericFunctions from '../nodes/Seven/GenericFunctions';

const makeHookContext = (
	overrides: {
		events?: string[];
		additionalFields?: Record<string, unknown>;
		staticData?: Record<string, unknown>;
	} = {},
) => {
	const staticData = overrides.staticData ?? {};
	const ctx = {
		getNodeWebhookUrl: jest.fn().mockReturnValue('https://n8n.example/webhook/abc'),
		getNodeParameter: jest.fn((name: string) => {
			if (name === 'events') return overrides.events ?? ['sms_mo', 'dlr'];
			if (name === 'additionalFields') return overrides.additionalFields ?? {};
			return undefined;
		}),
		getWorkflowStaticData: jest.fn().mockReturnValue(staticData),
		getNode: jest
			.fn()
			.mockReturnValue({ name: 'sevenTrigger', type: 'n8n-nodes-seven.sevenTrigger' }),
		helpers: {} as never,
	};
	return { ctx, staticData };
};

describe('SevenTrigger lifecycle', () => {
	let trigger: SevenTrigger;
	let apiRequestSpy: jest.SpyInstance;

	beforeEach(() => {
		trigger = new SevenTrigger();
		apiRequestSpy = jest.spyOn(GenericFunctions, 'sevenApiRequest');
	});

	afterEach(() => {
		apiRequestSpy.mockRestore();
	});

	describe('checkExists', () => {
		it('returns false when no matching hook exists', async () => {
			apiRequestSpy.mockResolvedValueOnce({ hooks: [] });
			const { ctx, staticData } = makeHookContext();

			const result = await trigger.webhookMethods.default.checkExists.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(false);
			expect(staticData.hookIds).toBeUndefined();
		});

		it('returns true and stores hook IDs when matching hooks exist', async () => {
			apiRequestSpy.mockResolvedValueOnce({
				hooks: [
					{ id: 1, target_url: 'https://n8n.example/webhook/abc', event_type: 'sms_mo' },
					{ id: 2, target_url: 'https://n8n.example/webhook/abc', event_type: 'dlr' },
					{ id: 3, target_url: 'https://other.example', event_type: 'sms_mo' },
				],
			});
			const { ctx, staticData } = makeHookContext({ events: ['sms_mo', 'dlr'] });

			const result = await trigger.webhookMethods.default.checkExists.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(true);
			expect(staticData.hookIds).toEqual([1, 2]);
		});

		it('returns false when only some selected events are covered', async () => {
			apiRequestSpy.mockResolvedValueOnce({
				hooks: [{ id: 1, target_url: 'https://n8n.example/webhook/abc', event_type: 'sms_mo' }],
			});
			const { ctx, staticData } = makeHookContext({ events: ['sms_mo', 'dlr'] });

			const result = await trigger.webhookMethods.default.checkExists.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(false);
			expect(staticData.hookIds).toBeUndefined();
		});

		it('treats an event_type=all hook as covering every selected event', async () => {
			apiRequestSpy.mockResolvedValueOnce({
				hooks: [{ id: 7, target_url: 'https://n8n.example/webhook/abc', event_type: 'all' }],
			});
			const { ctx, staticData } = makeHookContext({ events: ['sms_mo', 'dlr'] });

			const result = await trigger.webhookMethods.default.checkExists.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(true);
			expect(staticData.hookIds).toEqual([7]);
		});
	});

	describe('create', () => {
		it('subscribes one hook per selected event with request_method=JSON', async () => {
			apiRequestSpy
				.mockResolvedValueOnce({ hooks: [] })
				.mockResolvedValueOnce({ id: 11 })
				.mockResolvedValueOnce({ id: 12 });

			const { ctx, staticData } = makeHookContext({ events: ['sms_mo', 'dlr'] });

			const result = await trigger.webhookMethods.default.create.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(true);
			expect(apiRequestSpy).toHaveBeenCalledTimes(3);
			expect(apiRequestSpy).toHaveBeenNthCalledWith(
				2,
				'POST',
				'/hooks',
				expect.objectContaining({
					target_url: 'https://n8n.example/webhook/abc',
					event_type: 'sms_mo',
					request_method: 'JSON',
				}),
			);
			expect(staticData.hookIds).toEqual([11, 12]);
		});

		it('uses event_type=all when all events are selected and none exist yet', async () => {
			apiRequestSpy.mockResolvedValueOnce({ hooks: [] }).mockResolvedValueOnce({ id: 99 });

			const allEvents = [
				'sms_mo',
				'dlr',
				'tracking',
				'voice_call',
				'voice_status',
				'voice_dtmf',
				'rcs',
				'wa_mo',
			];
			const { ctx } = makeHookContext({ events: allEvents });

			await trigger.webhookMethods.default.create.call(ctx as unknown as IHookFunctions);

			expect(apiRequestSpy).toHaveBeenCalledTimes(2);
			expect(apiRequestSpy).toHaveBeenCalledWith(
				'POST',
				'/hooks',
				expect.objectContaining({ event_type: 'all' }),
			);
		});

		it('subscribes only uncovered events and keeps existing hook IDs', async () => {
			apiRequestSpy
				.mockResolvedValueOnce({
					hooks: [
						{ id: 1, target_url: 'https://n8n.example/webhook/abc', event_type: 'sms_mo' },
						{ id: 5, target_url: 'https://other.example', event_type: 'dlr' },
					],
				})
				.mockResolvedValueOnce({ id: 12 });

			const { ctx, staticData } = makeHookContext({ events: ['sms_mo', 'dlr'] });

			const result = await trigger.webhookMethods.default.create.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(true);
			expect(apiRequestSpy).toHaveBeenCalledTimes(2);
			expect(apiRequestSpy).toHaveBeenNthCalledWith(
				2,
				'POST',
				'/hooks',
				expect.objectContaining({ event_type: 'dlr' }),
			);
			expect(staticData.hookIds).toEqual([1, 12]);
		});

		it('returns false when no events are selected', async () => {
			const { ctx } = makeHookContext({ events: [] });

			const result = await trigger.webhookMethods.default.create.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(false);
			expect(apiRequestSpy).not.toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('deletes all stored hook IDs and clears static data', async () => {
			apiRequestSpy.mockResolvedValue({ success: true });
			const { ctx, staticData } = makeHookContext({
				staticData: { hookIds: [11, 12, 13] },
			});

			const result = await trigger.webhookMethods.default.delete.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(true);
			expect(apiRequestSpy).toHaveBeenCalledTimes(3);
			expect(apiRequestSpy).toHaveBeenCalledWith('DELETE', '/hooks', { id: 11 });
			expect(apiRequestSpy).toHaveBeenCalledWith('DELETE', '/hooks', { id: 12 });
			expect(apiRequestSpy).toHaveBeenCalledWith('DELETE', '/hooks', { id: 13 });
			expect(staticData.hookIds).toBeUndefined();
		});

		it('continues deleting remaining hooks if one fails and retains the failed ID', async () => {
			apiRequestSpy
				.mockResolvedValueOnce({ success: true })
				.mockRejectedValueOnce(new Error('boom'))
				.mockResolvedValueOnce({ success: true });

			const { ctx, staticData } = makeHookContext({
				staticData: { hookIds: [11, 12, 13] },
			});

			const result = await trigger.webhookMethods.default.delete.call(
				ctx as unknown as IHookFunctions,
			);

			expect(result).toBe(false);
			expect(apiRequestSpy).toHaveBeenCalledTimes(3);
			expect(staticData.hookIds).toEqual([12]);
		});
	});
});
