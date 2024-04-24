import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import { describe, expect, it, vitest } from 'vitest';

import { TestExplorerWidHealthCheck } from './testExplorer';
import { mockedBalanceWithWid, mockedCollateralBox } from './explorer.mock';

vitest.mock('@rosen-clients/ergo-explorer');

describe('ExplorerWidHealthCheckParam', () => {
  describe('update', () => {
    const wid =
      'e39047fa7025f5eb94f0b1a9d6d4728b5a4270ea1155e4e5b0e265db46589d5c';

    /**
     * @target ExplorerWidHealthCheckParam.update Should update the wid status to exists
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer watcher address assets
     * - mock return value of explorer address boxes
     * - create new instance of ErgoExplorerWidHealthCheck
     * - update the parameter
     * @expected
     * - The widExists should update to true successfully using explorer api
     */
    it('Should update the wid status to exists', async () => {
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          // mock return value of explorer watcher address assets
          getApiV1AddressesP1BalanceConfirmed: mockedBalanceWithWid(wid),
          // mock return value of explorer address
          getApiV1BoxesUnspentByaddressP1: async () => {
            return {
              items: [
                mockedCollateralBox('awcNft', wid),
                mockedCollateralBox(
                  'awcNft',
                  '74f3775de5fe5002c197311ebb80eaa4346646f24d8381b1bf271c11fd2ee095',
                ),
              ],
              total: 2,
            };
          },
        },
      } as unknown as ReturnType<typeof ergoExplorerClientFactory>);

      // create new instance of ErgoExplorerWidHealthCheck
      const widHealthCheckParam = new TestExplorerWidHealthCheck(
        'collateralAddress',
        'awcNft',
        'address',
        'explorer_url',
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toBe(true);
    });

    /**
     * @target ExplorerWidHealthCheckParam.update Should update the wid status to not exists
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer watcher address assets
     * - mock return value of explorer address
     * - create new instance of ErgoExplorerWidHealthCheck
     * - update the parameter
     * @expected
     * - The widExists should update to false successfully using explorer api
     */
    it('Should update the wid status to not exists', async () => {
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          // mock return value of explorer watcher address assets
          getApiV1AddressesP1BalanceConfirmed: mockedBalanceWithWid('no-wid'),
          // mock return value of explorer address
          getApiV1BoxesUnspentByaddressP1: async () => {
            return {
              items: [mockedCollateralBox('awcNft', wid)],
              total: 1,
            };
          },
        },
      } as unknown as ReturnType<typeof ergoExplorerClientFactory>);

      // create new instance of ErgoExplorerWidHealthCheck
      const widHealthCheckParam = new TestExplorerWidHealthCheck(
        'collateralAddress',
        'awcNft',
        'address',
        'explorer_url',
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toBe(false);
    });

    /**
     * @target ExplorerWidHealthCheckParam.update Should update the wid status to exists with multiple responses
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of explorer watcher address assets
     * - mock return value of explorer address boxes
     * - create new instance of ErgoExplorerWidHealthCheck
     * - update the parameter
     * @expected
     * - The widExists should update to true successfully using explorer api
     */
    it('Should update the wid status to exists with multiple responses', async () => {
      const boxesApiMock = vitest.fn();
      vitest.mocked(ergoExplorerClientFactory).mockReturnValue({
        v1: {
          // mock return value of explorer watcher address assets
          getApiV1AddressesP1BalanceConfirmed: mockedBalanceWithWid(wid),
          getApiV1BoxesUnspentByaddressP1: boxesApiMock,
        },
      } as unknown as ReturnType<typeof ergoExplorerClientFactory>);

      // mock return value of explorer address
      boxesApiMock
        .mockReturnValueOnce({
          items: [mockedCollateralBox('fakeAwc', wid)],
          total: 103,
        })
        .mockReturnValueOnce({
          items: [mockedCollateralBox('awcNft', wid)],
          total: 103,
        });

      const widHealthCheckParam = new TestExplorerWidHealthCheck(
        'collateralAddress',
        'awcNft',
        'address',
        'explorer_url',
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toBe(true);
    });
  });
});
