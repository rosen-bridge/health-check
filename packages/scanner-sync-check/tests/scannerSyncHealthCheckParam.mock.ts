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
    return { height: 1111, timestamp: Date.now() / 1000 };
  };

  /**
   * mocked getLastSavedBlockMessage method
   */
  getLastSavedBlockMessage = () => {
    return 'message';
  };

  /**
   * set mocked last block gap
   */
  setLastBlockGap = (gap: number) => {
    this['lastBlockGap'] = gap;
  };

  setScannerUpdateInterval = (interval: number) => {
    this['scannerUpdateInterval'] = interval;
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
