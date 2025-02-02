import { HealthStatusLevel } from '@rosen-bridge/health-check';
import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { beforeAll, describe, expect, it, vitest } from 'vitest';

import { TestErgoNodeSyncHealthCheckParam } from './testErgoNodeSync';

vitest.useFakeTimers();
vitest.mock('@rosen-clients/ergo-node');

describe('ErgoNodeSyncHealthCheckParam', () => {
  describe('getHealthStatus', () => {
    /**
     * Creating a new instance of ErgoNodeSyncHealthCheckParam for all tests
     */
    let nodeSyncHealthCheckParam: TestErgoNodeSyncHealthCheckParam;
    beforeAll(() => {
      nodeSyncHealthCheckParam = new TestErgoNodeSyncHealthCheckParam(
        100,
        10,
        20,
        50,
        'url',
      );
    });

    /**
     * @target ErgoNodeSyncHealthCheckParam.getHealthStatus should return HEALTHY when all conditions are false
     * @dependencies
     * @scenario
     * - mock height difference
     * - mock last block time
     * - mock peer count
     * - mock peer difference
     * - get health status
     * @expected
     * - The status should be HEALTHY
     */
    it('should return HEALTHY when all conditions are false', async () => {
      nodeSyncHealthCheckParam.setNodeHeightDifference(90);
      nodeSyncHealthCheckParam.setNodeLastBlockTime(5);
      nodeSyncHealthCheckParam.setNodePeerCount(21);
      nodeSyncHealthCheckParam.setNodePeerHeightDifference(25);
      const status = await nodeSyncHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.HEALTHY);
    });

    /**
     * @target ErgoNodeSyncHealthCheckParam.getHealthStatus Should return UNSTABLE when at least one conditions is true
     * @dependencies
     * @scenario
     * - mock height difference
     * - mock last block time
     * - mock peer count
     * - mock peer difference
     * - get health status
     * @expected
     * - The status should be UNSTABLE
     */
    it('should return UNSTABLE when at least one conditions is true', async () => {
      nodeSyncHealthCheckParam.setNodeHeightDifference(90);
      nodeSyncHealthCheckParam.setNodeLastBlockTime(5);
      nodeSyncHealthCheckParam.setNodePeerCount(10);
      nodeSyncHealthCheckParam.setNodePeerHeightDifference(25);
      const status = await nodeSyncHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.UNSTABLE);
    });

    /**
     * @target ErgoNodeSyncHealthCheckParam.getHealthStatus Should return the should return BROKEN when at least three conditions is true
     * @dependencies
     * @scenario
     * - mock height difference
     * - mock last block time
     * - mock peer count
     * - mock peer difference
     * - get health status
     * @expected
     * - The status should be BROKEN
     */
    it('should return BROKEN when at least three conditions is true', async () => {
      nodeSyncHealthCheckParam.setNodeHeightDifference(900);
      nodeSyncHealthCheckParam.setNodeLastBlockTime(12);
      nodeSyncHealthCheckParam.setNodePeerCount(10);
      nodeSyncHealthCheckParam.setNodePeerHeightDifference(25);
      const status = await nodeSyncHealthCheckParam.getHealthStatus();
      expect(status).toEqual(HealthStatusLevel.BROKEN);
    });
  });

  describe('update', () => {
    /**
     * @target ErgoNodeSyncHealthCheckParam.update Should update all parameters correctly
     * @dependencies
     * @scenario
     * - mock node info api
     * - mock node last block headers api
     * - mock node connected peers api
     * - mock node peers sync info api
     * - get health status
     * @expected
     * - Should update the height difference, last block time, peer count and peer height difference
     */
    it('should update all parameters correctly', async () => {
      vitest.mocked(ergoNodeClientFactory).mockReturnValue({
        getNodeInfo: async () => ({
          headersHeight: 12345n,
          fullHeight: 12300n,
        }),
        getLastHeaders: async () => [
          {
            timestamp: 1687161388456,
          },
        ],
        getConnectedPeers: async () => [
          {
            address: '127.0.0.1:5678',
          },
          {
            address: '127.0.0.1:5679',
          },
        ],
        getPeersSyncInfo: async () => [
          {
            height: 12350,
          },
          {
            height: 12355,
          },
        ],
      } as unknown as ReturnType<typeof ergoNodeClientFactory>);
      vitest.setSystemTime(1687167388456);

      const nodeSyncHealthCheck = new TestErgoNodeSyncHealthCheckParam(
        100,
        10,
        20,
        50,
        'url',
      );
      await nodeSyncHealthCheck.update();
      expect(nodeSyncHealthCheck.getHeightDifference()).toEqual(45);
      expect(nodeSyncHealthCheck.getLastBlockTime()).toEqual(100);
      expect(nodeSyncHealthCheck.getPeerCount()).toEqual(2);
      expect(nodeSyncHealthCheck.getPeerDifference()).toEqual(55);
    });
  });
});
