import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { describe, expect, it, vitest } from 'vitest';

import { TestNodePermitHealthCheck } from './testNode';
import { nodeUnspentBoxesByAddress } from './testData';

vitest.mock('@rosen-clients/ergo-node');

describe('NodePermitAssetHealthCheckParam', () => {
  describe('update', () => {
    /**
     * @target NodePermitAssetHealthCheckParam.update Should update the permit count using node
     * @dependencies
     * - ergoNodeClientFactory
     * @scenario
     * - mock return value of node permit address boxes
     * - create new instance of ErgoNodeAssetHealthCheck
     * - update the parameter
     * @expected
     * - The permit count should update successfully using node api
     */
    it('Should update the permit count using node', async () => {
      // mock the return value of node permit address boxes
      let firstOut = true;
      vitest.mocked(ergoNodeClientFactory).mockReturnValue({
        getBoxesByAddressUnspent: async () => {
          if (firstOut) {
            firstOut = false;
            return nodeUnspentBoxesByAddress;
          } else return [];
        },
      } as unknown as ReturnType<typeof ergoNodeClientFactory>);

      // create new instance of ErgoNodeAssetHealthCheck
      const assetHealthCheckParam = new TestNodePermitHealthCheck(
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
