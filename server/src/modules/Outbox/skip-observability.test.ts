import { logger } from '../../core/helpers/logger';
import { logStockReturnedSkip } from './skip-observability';

/**
 * The defect these tests pin (EMR #21, #22) is not that the guards skip — skipping is correct —
 * but that the skip used to be INVISIBLE. So the assertions are about the log call itself: that
 * one is made, at a level production actually keeps, naming the ids an operator needs to find the
 * row, and carrying no demographics.
 */
describe('logStockReturnedSkip (#21, #22)', () => {
  let warn: jest.SpyInstance;
  let info: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(logger, 'warn').mockImplementation(() => logger);
    info = jest.spyOn(logger, 'info').mockImplementation(() => logger);
  });

  afterEach(() => jest.restoreAllMocks());

  const lastMessage = (): string => String(warn.mock.calls[0][0]);

  describe.each([
    ['dispensary_to_store' as const, 'missing_batch_id' as const],
    ['dispensary_to_store' as const, 'missing_item_code' as const],
    ['patient_to_dispensary' as const, 'missing_batch_id' as const],
    ['patient_to_dispensary' as const, 'missing_item_code' as const],
  ])('%s / %s', (source, reason) => {
    beforeEach(() => {
      logStockReturnedSkip({
        source,
        reason,
        return_id: 512,
        drug_id: 37,
        pharmacy_store_id: 84,
        inventory_item_id: 91,
      });
    });

    it('logs exactly once', () => {
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('logs at warn, NOT info — logger.ts resolves the level to warn in production, so an info line would itself be invisible', () => {
      expect(info).not.toHaveBeenCalled();
    });

    it('names the flow and the reason, so the two gaps are distinguishable in the log', () => {
      expect(lastMessage()).toContain(source);
      expect(lastMessage()).toContain(`reason=${reason}`);
    });

    it('names every id an operator needs to find the row', () => {
      expect(lastMessage()).toContain('return_id=512');
      expect(lastMessage()).toContain('drug_id=37');
      expect(lastMessage()).toContain('pharmacy_store_id=84');
      expect(lastMessage()).toContain('inventory_item_id=91');
    });

    it('is tagged stock.returned, so the skips are greppable as one class', () => {
      expect(lastMessage()).toContain('[stock.returned]');
    });
  });

  it('omits ids that are absent rather than printing null or undefined', () => {
    logStockReturnedSkip({
      source: 'patient_to_dispensary',
      reason: 'missing_batch_id',
      return_id: 7,
      pharmacy_store_id: null,
    });

    expect(lastMessage()).toContain('return_id=7');
    expect(lastMessage()).not.toContain('null');
    expect(lastMessage()).not.toContain('undefined');
  });

  it('carries no demographics or money (ADR-0016 applies to logs as to event bodies)', () => {
    logStockReturnedSkip({
      source: 'dispensary_to_store',
      reason: 'missing_item_code',
      return_id: 1,
      drug_id: 2,
    });

    expect(lastMessage()).not.toMatch(/patient/i);
    expect(lastMessage()).not.toMatch(/price/i);
    expect(lastMessage()).not.toMatch(/cost/i);
    expect(lastMessage()).not.toMatch(/reason_for_return/i);
  });

  it('NEVER throws, even when the logger itself fails — observability must not abort a clinical transaction', () => {
    warn.mockImplementation(() => {
      throw new Error('transport down');
    });

    expect(() =>
      logStockReturnedSkip({
        source: 'dispensary_to_store',
        reason: 'missing_batch_id',
        return_id: 1,
      })
    ).not.toThrow();
  });
});
