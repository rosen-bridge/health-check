import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { describe, expect, it, vitest } from 'vitest';

import { ErgoExplorerScannerHealthCheck } from '../../lib';

vitest.mock('@rosen-clients/ergo-explorer');

describe('ErgoScannerHealthCheck', () => {
  describe('ErgoExplorerScannerHealthCheck.getLastAvailableBlock', () => {
    /**
     * @target ErgoExplorerScannerHealthCheck.getLastAvailableBlock Should return the last available block in network
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer last block info
     * - create new instance of ErgoExplorerScannerHealthCheck
     * - update the parameter
     * @expected
     * - The block height should be correct
     */
    it('Should return the last available block in network', async () => {
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1Networkstate: async () => ({
            height: 1115,
          }),
        },
      } as unknown as ReturnType<typeof ergoExplorerClientFactory>);

      const scannerHealthCheckParam = new ErgoExplorerScannerHealthCheck(
        () => Promise.resolve(1111),
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
