import ergoNodeClientFactory from '@rosen-clients/ergo-node';
import { describe, expect, it, vitest } from 'vitest';

import { TestNodeWidHealthCheck } from './testNode';
import { mockedBalanceWithWid, mockedCollateralBox } from './node.mock';

vitest.mock('@rosen-clients/ergo-node');

describe('NodeWidHealthCheckParam', () => {
  describe('update', () => {
    const wid =
      'e39047fa7025f5eb94f0b1a9d6d4728b5a4270ea1155e4e5b0e265db46589d5c';

    /**
     * @target NodeWidHealthCheckParam.update Should update the wid status to exists
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node watcher address assets
     * - mock return value of node address boxes
     * - create new instance of NodeWidHealthCheckParam
     * - update the parameter
     * @expected
     * - The widExists should update to true successfully using node api
     */
    it('Should update the wid status to exists', async () => {
      const BoxesApiMock = vitest.fn();
      vitest.mocked(ergoNodeClientFactory).mockReturnValue({
        // mock return value of node watcher address assets
        getAddressBalanceTotal: mockedBalanceWithWid(wid),
        getBoxesByAddressUnspent: BoxesApiMock,
      } as unknown as ReturnType<typeof ergoNodeClientFactory>);

      // mock return value of node address boxes
      BoxesApiMock.mockReturnValueOnce([
        mockedCollateralBox('awcNft', wid),
        mockedCollateralBox('fakeAwc', wid),
      ]).mockReturnValue([]);

      // create new instance of ErgoNodeWidHealthCheck
      const widHealthCheckParam = new TestNodeWidHealthCheck(
        'rwtRepoAddress',
        'awcNft',
        'address',
        'node_url',
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toEqual(true);
    });

    /**
     * @target NodeWidHealthCheckParam.update Should update the wid status to not exists
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node watcher address assets
     * - mock return value of node address boxes
     * - create new instance of NodeWidHealthCheckParam
     * - update the parameter
     * @expected
     * - The widExists should update to false successfully using node api
     */
    it('Should update the wid status to not exists', async () => {
      const BoxesApiMock = vitest.fn();
      vitest.mocked(ergoNodeClientFactory).mockReturnValue({
        // mock return value of node watcher address assets
        getAddressBalanceTotal: mockedBalanceWithWid('no-wid'),
        getBoxesByAddressUnspent: BoxesApiMock,
      } as unknown as ReturnType<typeof ergoNodeClientFactory>);

      // mock return value of node address boxes
      BoxesApiMock.mockReturnValueOnce([
        mockedCollateralBox(
          'awcNft',
          '74f3775de5fe5002c197311ebb80eaa4346646f24d8381b1bf271c11fd2ee095',
        ),
        mockedCollateralBox('fakeAwc', wid),
      ]).mockReturnValue([]);

      // create new instance of ErgoNodeWidHealthCheck
      const widHealthCheckParam = new TestNodeWidHealthCheck(
        'rwtRepoAddress',
        'awcNft',
        'address',
        'node_url',
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toEqual(false);
    });

    /**
     * @target NodeWidHealthCheckParam.update Should update the wid status to exists with multiple responses
     * @dependencies
     * - ergoExplorerClientFactory
     * @scenario
     * - mock return value of node watcher address assets
     * - mock return value of node address boxes
     * - create new instance of NodeWidHealthCheckParam
     * - update the parameter
     * @expected
     * - The widExists should update to true successfully using node api
     */
    it('Should update the wid status to exists with multiple responses', async () => {
      const BoxesApiMock = vitest.fn();
      vitest.mocked(ergoNodeClientFactory).mockReturnValue({
        // mock return value of node watcher address assets
        getAddressBalanceTotal: mockedBalanceWithWid(wid),
        getBoxesByAddressUnspent: BoxesApiMock,
      } as unknown as ReturnType<typeof ergoNodeClientFactory>);

      // mock return value of node address boxes
      BoxesApiMock.mockReturnValueOnce([mockedCollateralBox('fakeAwc', wid)])
        .mockReturnValueOnce([mockedCollateralBox('awcNft', wid)])
        .mockReturnValue([]);

      // create new instance of ErgoNodeWidHealthCheck
      const widHealthCheckParam = new TestNodeWidHealthCheck(
        'rwtRepoAddress',
        'awcNft',
        'address',
        'node_url',
      );

      // update the parameter
      await widHealthCheckParam.update();
      expect(widHealthCheckParam.getWidStatus()).toEqual(true);
    });
  });
});
