import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from '@apollo/client/link/http';
import fetch from 'cross-fetch';

import { AbstractScannerSyncHealthCheckParam } from '../abstract';
import { CurrentHeightQuery, currentHeightQuery } from './types/graphqlTypes';

export class CardanoGraphQLScannerHealthCheck extends AbstractScannerSyncHealthCheckParam {
  protected client;

  constructor(
    getLastSavedBlockHeight: () => Promise<number>,
    warnDifference: number,
    criticalDifference: number,
    graphqlUri: string,
    warnBlockGap = warnDifference,
    criticalBlockGap = criticalDifference,
    blockTime = 20,
  ) {
    super(
      getLastSavedBlockHeight,
      warnDifference,
      criticalDifference,
      warnBlockGap,
      criticalBlockGap,
      blockTime,
    );
    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({ uri: graphqlUri, fetch }),
    });
  }

  /**
   * generate a unique id with network name and type
   * @returns parameter id
   */
  getId = (): string => {
    return `cardano_graphql_scanner`;
  };

  /**
   * generate a unique title with network name and type
   * @returns parameter title
   */
  getTitle = async () => {
    return `Cardano Graphql Scanner Sync`;
  };

  /**
   * generate parameter description
   * @returns parameter description
   */
  getLastSavedBlockMessage = async () => {
    return `The last block saved by the Cardano Graphql scanner is ${await this.getLastSavedBlockHeight()}.`;
  };

  /**
   * @returns last available block in network
   */
  getLastAvailableBlock = () => {
    return this.client
      .query<CurrentHeightQuery>({
        query: currentHeightQuery,
      })
      .then((res) => {
        const height = res.data.cardano.tip.number;
        return height ?? 0;
      });
  };
}
