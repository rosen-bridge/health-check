import { ScannerSyncHealthCheckParam } from '../lib';

class TestScannerHealthCheckParam extends ScannerSyncHealthCheckParam {
  /**
   * mocked getId method
   */
  getId = () => {
    return 'Id';
  };

  /**
   * mocked getTitle method
   */
  getTitle = () => {
    return 'Title';
  };

  /**
   * mocked getDescription method
   */
  getDescription = () => {
    return 'Description';
  };

  /**
   * mocked update method
   */
  getLastSavedBlock = async () => {
    return { height: 1115, timestamp: 4323489754 };
  };

  /**
   * mocked getLastSavedBlockMessage method
   */
  getLastSavedBlockMessage = () => {
    return 'message';
  };

  /**
   * set mocked difference
   * @param difference mocked difference
   */
  setDifference = (difference: number) => {
    this.difference = difference;
  };

  /**
   * set mocked last block time
   * @param difference mocked difference
   */
  setLastBlockTime = (time: number) => {
    this.lastBlockTime = time;
  };

  /**
   * set mocked last block height
   * @param difference mocked difference
   */
  setLastBlockHeight = (height: number) => {
    this.lastBlockHeight = height;
  };

  /**
   * @returns protected height difference
   */
  getDifference = () => {
    return this.difference;
  };
}

export { TestScannerHealthCheckParam };
