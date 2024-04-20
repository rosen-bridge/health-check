import { describe, expect, it, vitest } from 'vitest';
import cardanoKoiosClientFactory from '@rosen-clients/cardano-koios';

import { createDataSource } from '../Utils';
import { CardanoKoiosScannerHealthCheck } from '../../lib';

vitest.mock('@rosen-clients/cardano-koios');

describe('CardanoKoiosScannerHealthCheck', () => {
  describe('CardanoKoiosScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target CardanoKoiosScannerHealthCheck.update Should return the last available block in network
     * @dependencies
     * - cardanoKoiosClientFactory
     * @scenario
     * - mock return value of koios last block info
     * - create new instance of CardanoKoiosScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      vitest.mocked(cardanoKoiosClientFactory).mockReturnValue({
        getTip: async () => [
          {
            block_no: 1115,
          },
        ],
      } as unknown as ReturnType<typeof cardanoKoiosClientFactory>);

      const dataSource = await createDataSource();
      const scannerHealthCheckParam = new CardanoKoiosScannerHealthCheck(
        dataSource,
        'scannerName',
        100,
        10,
        'url',
      );
      const height = await scannerHealthCheckParam.getLastAvailableBlock();
      expect(height).toEqual(1115);
    });
  });
});
