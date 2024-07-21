import { beforeAll, describe, expect, it } from 'vitest';
import { HealthStatusLevel } from '@rosen-bridge/health-check';

import { TxProgressHealthCheckParam } from '../lib/txProgress';
import { healthyTxs, signFailedTxs } from './testData';

describe('TxProgressHealthCheckParam', () => {
  describe('getHealthStatus', () => {
    let txProgressHealthCheckParam: TxProgressHealthCheckParam;
    beforeAll(() => {
      txProgressHealthCheckParam = new TxProgressHealthCheckParam(
        () => [],
        5,
        50,
      );
    });

    /**
     * @target TxProgressHealthCheckParam.getHealthStatus should return HEALTHY
     * when there is no sign failed transaction
     * @dependencies
     * @scenario
     * - mock txWithMaxSigningFailure to undefined
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when there is no sign failed transaction', async () => {
      txProgressHealthCheckParam['txWithMaxSigningFailure'] = undefined;
      const status = await txProgressHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target TxProgressHealthCheckParam.getHealthStatus should return UNSTABLE
     * when transaction signing failure attempts is more than warn threshold
     * @dependencies
     * @scenario
     * - mock txWithMaxSigningFailure to exceed sign failure warn threshold
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it(`should return UNSTABLE when transaction signing failure attempts is more
    than warn threshold `, async () => {
      txProgressHealthCheckParam['txWithMaxSigningFailure'] = signFailedTxs[0];
      const status = await txProgressHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target TxProgressHealthCheckParam.getHealthStatus should return UNSTABLE
     * when transaction signing failure attempts is more than critical threshold
     * @dependencies
     * @scenario
     * - mock txWithMaxSigningFailure to exceed sign failure critical threshold
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it(`should return BROKEN when transaction signing failure attempts is more
    than critical threshold `, async () => {
      txProgressHealthCheckParam['txWithMaxSigningFailure'] = signFailedTxs[6];
      const status = await txProgressHealthCheckParam.getHealthStatus();
      expect(status).toBe(HealthStatusLevel.BROKEN);
    });
  });

  describe('updateStatus', () => {
    /**
     * @target TxProgressHealthCheckParam.updateStatus should update stuck
     * transaction list to an empty array
     * @dependencies
     * @scenario
     * - mock getActiveTransactions to return healthy transactions
     * - run test (call `updateStatus`)
     * @expected
     * - should set stuckTransactions to an empty array
     * - should set txWithMaxSigningFailure to undefined
     */
    it('should update stuck transaction list to an empty array', () => {
      const txProgressHealthCheckParam = new TxProgressHealthCheckParam(
        () => healthyTxs,
        5,
        50,
      );
      txProgressHealthCheckParam.updateStatus();
      expect(txProgressHealthCheckParam['stuckTransactions']).toEqual([]);
      expect(
        txProgressHealthCheckParam['txWithMaxSigningFailure'],
      ).toBeUndefined();
    });

    /**
     * @target TxProgressHealthCheckParam.updateStatus should update stuck
     * transaction list to contain sign failed transactions
     * @dependencies
     * @scenario
     * - mock getActiveTransactions to return healthy and signFailed transactions
     * - run test (call `updateStatus`)
     * @expected
     * - should set stuckTransactions to all signFailed transactions
     * - should set txWithMaxSigningFailure to last signFailedTx
     */
    it('should update stuck transaction list to contain sign failed transactions', () => {
      const txProgressHealthCheckParam = new TxProgressHealthCheckParam(
        () => [...healthyTxs, ...signFailedTxs],
        5,
        50,
      );
      txProgressHealthCheckParam.updateStatus();
      expect(txProgressHealthCheckParam['stuckTransactions']).toEqual(
        signFailedTxs,
      );
      expect(txProgressHealthCheckParam['txWithMaxSigningFailure']).toEqual(
        signFailedTxs[6],
      );
    });
  });

  describe('getFailureAttempts', () => {
    let txProgressHealthCheckParam: TxProgressHealthCheckParam;
    beforeAll(() => {
      txProgressHealthCheckParam = new TxProgressHealthCheckParam(
        () => [],
        5,
        50,
      );
    });

    /**
     * @target TxProgressHealthCheckParam.getFailureAttempts should return warn
     * threshold and total stuck tx count when there is no critical sign problem
     * @dependencies
     * @scenario
     * - mock getActiveTransactions to warn signFailed transactions
     * - run test (call `getFailureAttempts`)
     * @expected
     * - should return warn threshold
     * - should return total number of stuck transactions
     */
    it(`should return warn threshold and total stuck tx count when there is no 
    critical sign problem`, () => {
      txProgressHealthCheckParam['txWithMaxSigningFailure'] = signFailedTxs[3];
      txProgressHealthCheckParam['stuckTransactions'] = signFailedTxs.slice(
        0,
        4,
      );
      const { failureAttempts, signFailedTxCount } =
        txProgressHealthCheckParam.getFailureAttempts()!;
      expect(failureAttempts).toEqual(5);
      expect(signFailedTxCount).toEqual(4);
    });

    /**
     * @target TxProgressHealthCheckParam.getFailureAttempts should return
     * critical threshold and number of txs with critical sign problem
     * @dependencies
     * @scenario
     * - mock getActiveTransactions to all signFailed transactions
     * - run test (call `getFailureAttempts`)
     * @expected
     * - should return critical threshold
     * - should return the number of txs with critical sign problem
     */
    it(`should return critical threshold and number of txs with critical sign 
    problem`, () => {
      txProgressHealthCheckParam['txWithMaxSigningFailure'] = signFailedTxs[6];
      txProgressHealthCheckParam['stuckTransactions'] = signFailedTxs;
      const { failureAttempts, signFailedTxCount } =
        txProgressHealthCheckParam.getFailureAttempts()!;
      expect(failureAttempts).toEqual(50);
      expect(signFailedTxCount).toEqual(2);
    });
  });
});
