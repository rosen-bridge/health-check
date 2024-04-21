import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { describe, expect, it, vitest } from 'vitest';

import { TestExplorerPermitHealthCheck } from './testExplorer';
import { explorerUnspentBoxesByAddress } from './testData';

vitest.mock('@rosen-clients/ergo-explorer');

describe('ExplorerPermitAssetHealthCheckParam', () => {
  describe('update', () => {
    /**
     * @target ExplorerPermitAssetHealthCheckParam.update Should update the permit count using explorer
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer permit address boxes
     * - create new instance of ErgoExplorerAssetHealthCheck
     * - update the parameter
     * @expected
     * - The permit count should update successfully using explorer api
     */
    it('Should update the permit count using explorer', async () => {
      // mock return value of explorer permit address boxes
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          getApiV1BoxesUnspentByaddressP1: async () => {
            return explorerUnspentBoxesByAddress;
          },
        },
      } as unknown as ReturnType<typeof ergoExplorerClientFactory>);

      // create new instance of ErgoExplorerAssetHealthCheck
      const assetHealthCheckParam = new TestExplorerPermitHealthCheck(
        '383d70ab083cc23336a46370fe730b2c51db0e831586b6d545202cbc33938ee1',
        'permitAddress',
        'd4e03eda58a338f8f65b40de258407dbdbbd9b8ccca374f66be8d97e52c8a752',
        100n,
        10n,
        'url',
        1n,
      );

      // update the parameter
      await assetHealthCheckParam.update();
      expect(assetHealthCheckParam.getReportCount()).toBe(22n);
    });
  });
});
