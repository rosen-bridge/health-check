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
    return { height: 1111, timestamp: Date.now() };
  };

  /**
   * mocked getLastSavedBlockMessage method
   */
  getLastSavedBlockMessage = () => {
    return 'message';
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
}

export { TestScannerHealthCheckParam };
