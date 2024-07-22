import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '@rosen-bridge/health-check';
import { maxBy } from 'lodash-es';

import { TxInfo } from './interfaces';

export class TxProgressHealthCheckParam extends AbstractHealthCheckParam {
  private stuckTransactions: Array<TxInfo> = [];
  private txWithMaxSigningFailure: TxInfo | undefined;

  constructor(
    private getActiveTransactions: () => Array<TxInfo>,
    private signFailedWarnThreshold: number,
    private signFailedCriticalThreshold: number,
  ) {
    super();
  }

  /**
   * Generate a title for parameter with asset name
   *
   * @returns Parameter title
   */
  getTitle = async (): Promise<string> => {
    return `Transaction Signing Progress`;
  };

  /**
   * Generate a unique id with asset name and address
   *
   * @returns Parameter id
   */
  getId = (): string => {
    return `tx_progress`;
  };

  /**
   * Generate parameter description
   *
   * @returns Parameter description
   */
  getDescription = async (): Promise<string> => {
    return `Checks the failure rates of transactions' signings.`;
  };

  /**
   * Return failure attempts and transaction count with signing failures
   * reaching this limit
   */
  getFailureAttempts = () => {
    if (!this.txWithMaxSigningFailure) return undefined;
    let failureAttempts = 0;
    if (
      this.txWithMaxSigningFailure.signFailedCount >=
      this.signFailedCriticalThreshold
    )
      failureAttempts = this.signFailedCriticalThreshold;
    else if (
      this.txWithMaxSigningFailure.signFailedCount >=
      this.signFailedWarnThreshold
    )
      failureAttempts = this.signFailedWarnThreshold;
    const signFailedTxCount = this.stuckTransactions.filter(
      (tx) => tx.signFailedCount >= failureAttempts,
    ).length;
    return {
      failureAttempts,
      signFailedTxCount,
    };
  };

  /**
   * Generate description based on signing failure attempts of transactions
   *
   * @returns Parameter health description
   */
  getDetails = async (): Promise<string | undefined> => {
    if (!this.txWithMaxSigningFailure) return undefined;
    const { failureAttempts, signFailedTxCount } = this.getFailureAttempts()!;
    const eventInfo =
      this.txWithMaxSigningFailure.eventId &&
      this.txWithMaxSigningFailure.txType in ['payment', 'reward']
        ? `related to event ${this.txWithMaxSigningFailure.eventId} `
        : '';
    return (
      `Service is not working correctly because ${signFailedTxCount} ` +
      `transactions failed in sign more than ${failureAttempts} times.` +
      `The transaction with the highest number of failed signing attempt is ` +
      `${this.txWithMaxSigningFailure.txId}. It's a ` +
      `${this.txWithMaxSigningFailure.txType} txn on ` +
      `${this.txWithMaxSigningFailure.chain} chain ` +
      eventInfo +
      `which failed to sign after ` +
      `${this.txWithMaxSigningFailure.signFailedCount} attempts.`
    );
  };

  /** @returns Tx progress health status */
  getHealthStatus = async (): Promise<HealthStatusLevel> => {
    if (!this.txWithMaxSigningFailure) return HealthStatusLevel.HEALTHY;
    if (
      this.txWithMaxSigningFailure.signFailedCount >=
      this.signFailedCriticalThreshold
    )
      return HealthStatusLevel.BROKEN;
    if (
      this.txWithMaxSigningFailure.signFailedCount >=
      this.signFailedWarnThreshold
    )
      return HealthStatusLevel.UNSTABLE;
    return HealthStatusLevel.HEALTHY;
  };

  /** Update the stuck transaction list and tx with max singing failure */
  updateStatus = () => {
    const activeTransactions = this.getActiveTransactions();
    this.stuckTransactions = activeTransactions.filter(
      (tx) => tx.signFailedCount >= this.signFailedWarnThreshold,
    );
    this.txWithMaxSigningFailure = maxBy(
      this.stuckTransactions,
      'signFailedCount',
    );
  };
}
