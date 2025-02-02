import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from '@apollo/client/link/http';
import fetch from 'cross-fetch';

import { CARDANO_NATIVE_ASSET } from '../constants';
import { AbstractAssetHealthCheckParam } from '../abstract';
import {
  AddressAssetsQuery,
  addressAssetsQuery,
  addressQueryVariables,
} from './types/graphqlTypes';

export class CardanoGraphQLAssetHealthCheckParam extends AbstractAssetHealthCheckParam {
  protected client;

  constructor(
    assetId: string,
    assetName: string,
    address: string,
    warnThreshold: bigint,
    criticalThreshold: bigint,
    graphqlUri: string,
    assetDecimal = 0,
  ) {
    super(
      assetId,
      assetName === CARDANO_NATIVE_ASSET ? assetName.toUpperCase() : assetName,
      address,
      warnThreshold,
      criticalThreshold,
      assetDecimal,
    );
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({ uri: graphqlUri, fetch }),
    });
  }

  /**
   * update health status for this param
   */
  updateStatus = async () => {
    let tokenAmount = 0n;
    const res = await this.client.query<AddressAssetsQuery>({
      query: addressAssetsQuery,
      variables: addressQueryVariables(this.address),
    });

    const addresses = res.data.paymentAddresses;
    if (addresses && addresses[0]?.summary?.assetBalances) {
      const assets = addresses[0].summary.assetBalances;
      if (this.assetId == CARDANO_NATIVE_ASSET) {
        // get ADA value
        const adaAmount = assets.find(
          (balance) => balance?.asset.policyId === 'ada',
        )?.quantity;
        if (adaAmount) tokenAmount = BigInt(adaAmount);
      } else {
        // get tokens value
        const assetUnit = this.assetId.split('.');
        const amount = assets.find(
          (balance) =>
            balance?.asset.policyId === assetUnit[0] &&
            balance?.asset.assetName === assetUnit[1],
        )?.quantity;
        if (amount) tokenAmount = BigInt(amount);
      }
    }
    this.tokenAmount = tokenAmount;
  };
}
