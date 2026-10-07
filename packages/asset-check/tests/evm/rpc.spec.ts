import { describe, expect, it } from 'vitest';

import { ETHEREUM_NATIVE_ASSET } from '../../lib/constants';
import { TestEvmRpcAssetHealthCheck } from './testEvm';

// These tests intentionally run against the real ethers implementation:
// the timeout lives on the provider connection, and a mocked provider
// cannot observe whether it was applied.
describe('EvmRpcAssetHealthCheckParam timeout', () => {
  const lockAddress = '0x0000000000000000000000000000000000000000';

  /**
   * @target `EvmRpcAssetHealthCheckParam` should apply the configured
   * timeout to the provider connection
   * @dependencies
   * @scenario
   * - construct the param with an explicit timeout
   * - read the timeout back from a fresh connection clone
   * @expected
   * - it should equal the configured timeout, not the ethers default
   */
  it('should apply the configured timeout to the provider connection', () => {
    const param = new TestEvmRpcAssetHealthCheck(
      'ethereum',
      ETHEREUM_NATIVE_ASSET,
      ETHEREUM_NATIVE_ASSET,
      ETHEREUM_NATIVE_ASSET,
      lockAddress,
      100n,
      10n,
      'http://localhost:8545',
      12345,
    );

    expect(param.getProvider()._getConnection().timeout).toEqual(12345);
  });

  /**
   * @target `EvmRpcAssetHealthCheckParam` should keep the ethers default
   * timeout when no timeout is configured
   * @dependencies
   * @scenario
   * - construct the param without a timeout
   * - read the timeout back from a fresh connection clone
   * @expected
   * - it should equal the ethers default of 300000 ms
   */
  it('should keep the default timeout when none is configured', () => {
    const param = new TestEvmRpcAssetHealthCheck(
      'ethereum',
      ETHEREUM_NATIVE_ASSET,
      ETHEREUM_NATIVE_ASSET,
      ETHEREUM_NATIVE_ASSET,
      lockAddress,
      100n,
      10n,
      'http://localhost:8545',
    );

    expect(param.getProvider()._getConnection().timeout).toEqual(300000);
  });

  /**
   * @target `EvmRpcAssetHealthCheckParam` should apply the timeout and
   * keep the auth token in the connection url
   * @dependencies
   * @scenario
   * - construct the param with a timeout and an auth token
   * - read the url and timeout back from a fresh connection clone
   * @expected
   * - the url should end with the auth token
   * - the timeout should equal the configured timeout
   */
  it('should apply the timeout when an auth token is used', () => {
    const param = new TestEvmRpcAssetHealthCheck(
      'ethereum',
      ETHEREUM_NATIVE_ASSET,
      ETHEREUM_NATIVE_ASSET,
      ETHEREUM_NATIVE_ASSET,
      lockAddress,
      100n,
      10n,
      'http://localhost:8545',
      5000,
      'secret-token',
    );
    const connection = param.getProvider()._getConnection();

    expect(connection.url).toEqual('http://localhost:8545/secret-token');
    expect(connection.timeout).toEqual(5000);
  });
});
