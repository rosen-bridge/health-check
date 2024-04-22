import { describe, expect, it, vitest } from 'vitest';
import { createLedgerStateQueryClient } from '@cardano-ogmios/client';

import { createDataSource } from '../utils';
import { CardanoOgmiosScannerHealthCheck } from '../../lib';

vitest.mock('@cardano-ogmios/client');

describe('CardanoOgmiosScannerHealthCheck', () => {
  describe('CardanoOgmiosScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target CardanoOgmiosScannerHealthCheck.update Should return the last available block in network
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of ogmios api
     * - create new instance of CardanoOgmiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      vitest
        .mocked(createLedgerStateQueryClient)
        .mockImplementation(async () => {
          return {
            networkBlockHeight: async () => 1115,
          } as unknown as ReturnType<typeof createLedgerStateQueryClient>;
        });

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new CardanoOgmiosScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url',
        123,
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });
});
